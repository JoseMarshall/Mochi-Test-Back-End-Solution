import { sendWelcomeEmail } from "../email";
import { dynamodb } from "../../aws";
import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { PdfAttach, CreatedUser } from "../../models";
import { v4 as uuid } from "uuid";
import { s3 } from "../../aws";
import * as fileType from "file-type";
import {existUsername} from '../user'

const successfullySent = (response) => {
	return {
		statusCode: 200,
		body: JSON.stringify({
			message:
				"Ficheiro pdf carregado e email enviado com sucesso, por favor checa a sua caixa de entrada",
			linkToPdf: response.linkToPdf,
		}),
	};
};

const failedSending = (response) => {
	return {
		statusCode: 500,
		body: JSON.stringify({
			message: "Alguma coisa correu mal enquanto tentava enviar o email",
			response,
		}),
	};
};

const getURL = async (file: Buffer) => {
	const pdfId = `${uuid()}.pdf`;
	const s3Params = {
		Bucket: process.env.BUCKET_NAME,
		Key: pdfId,
		Body: file,
		ContentType: "application/pdf",
		ACL: "public-read",
	};

	return new Promise(async (resolve, reject) => {
		await s3
			.putObject(s3Params)
			.promise()
			.then((data) => {
				const url = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${pdfId}`;
				resolve(url);
			})
			.catch(reject);
	});
};

const sendEmail = async (user: PdfAttach, callback: Callback) => {
	const params = {
		TableName: "users",
		Key: {
			userId: user.username,
		},
		ProjectionExpression: `userId,
                          firstName,
                          lastName,
                          email,
                          username,
                          createdAt`,
	};
	return dynamodb
		.get(params)
		.promise()
		.then(async (data) => {
			const userUpdated = {
				TableName: "users",
				Key: { userId: user.username },
				UpdateExpression: "set linkToPdf = :link",
				ExpressionAttributeValues: {
					":link": user.linkToPdf,
				},
				ReturnValues: "UPDATED_NEW",
			};
			//Stores the the link to pdf in the user table
			await dynamodb
				.update(userUpdated)
				.promise()
				.then(async () => {
					await sendWelcomeEmail({
						...data.Item,
						linkToPdf: user.linkToPdf,
					} as CreatedUser)
						.then((res) => callback(null, successfullySent({response: res, linkToPdf: user.linkToPdf})))
						.catch((error) => callback(null, failedSending(error)));
				});
		})
		.catch((error) => callback(null, failedSending(error)));
};

const uploadPdf = async (
	event: APIGatewayProxyEvent,
	context: Context,
	callback: Callback
) => {
	const requestBody = JSON.parse(event.body);
	const base64String = requestBody.pdf;
	const buffer =  Buffer.from(base64String, "base64");
	const fileMime = await fileType.fromBuffer(buffer);

	if (!fileMime || fileMime.ext !== "pdf") {
		return callback(null, {
			statusCode: 400,
			body: JSON.stringify({
				error: `Tipo de ficheiro não suportado, apenas suportado ficheiros: '.pdf' enviado ${fileMime.ext}`,
			}),
		});
	}

	await existUsername(requestBody.username)
	.then(async (exists) => {
		if(exists){
			await getURL(buffer) //Write image to bucket
				.then(async (linkToPdf: string) => {
					await sendEmail({ username: requestBody.username, linkToPdf }, callback);
				})
				.catch((err) =>
					callback(null, failedSending({error: 'Failed uploading the file'}))
				);
		}
		else{
			callback(null,  {
				statusCode: 403,
				body: JSON.stringify({
					error: 'Failed uploading the file',
				}),
			})
		}
	})
	.catch((err) =>
	callback(null, failedSending({error: 'Failed uploading the file'}))
)
};

export { uploadPdf };
