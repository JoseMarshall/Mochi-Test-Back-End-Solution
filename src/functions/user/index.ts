import { dynamodb } from "../../aws";
import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import {
	removeEspecialChars,
	isValideEmail,
	sanitizeHtml,
} from "../../helpers";
import { FormData, CreatedUser } from "../../models";

const userInfo = (data: FormData): CreatedUser => {
	const timestamp = new Date().toJSON();
	const { username, password, firstName, lastName, email } = data;
	return {
		userId: username,
		firstName: firstName,
		lastName: lastName,
		email: email,
		username: username,
		password: password,
		createdAt: timestamp,
		updatedAt: timestamp,
	};
};

const submitUser = async (user: CreatedUser) => {
	const newUser = {
		TableName: "users",
		Item: user,
	};

	return dynamodb
		.put(newUser)
		.promise()
		.then(() => user);
};

const generateUsernameSuggestions = ({
	firstName,
	lastName,
	username,
}: FormData) => {
	return new Promise<string[]>(async (resolve, reject) => {
		const milliSeconds = new Date().getMilliseconds().toString() + "00";
		const day = new Date().getDate().toString();
		const listSuggestion: string[] = []; //temporary username
		let keepOn = true;
		let nameTrimed: string;
		//test each possible username within the array, and assign the valid one to listSuggestion
		for (let iterator of [
			firstName,
			lastName,
			firstName + day,
			lastName + day,
			firstName + milliSeconds,
			lastName + milliSeconds,
			firstName[0] + lastName,
			firstName[0] + lastName + milliSeconds[0],
			firstName[0] + lastName + milliSeconds[1],
			firstName[0] + lastName + milliSeconds[2],
			firstName[0] + lastName + day,
		]) {
			iterator = removeEspecialChars(iterator);
			await existUsername(iterator).then((exist) => {
				if (!exist) {
					listSuggestion.push(iterator);
					if (listSuggestion.length > 2) {
						keepOn = false;
					}
				}
			});

			if (!keepOn) {
				resolve(listSuggestion);
				break;
			}
		}

		//In case none of above sugestion worked
		if (listSuggestion.length == 0) {
			nameTrimed = removeEspecialChars(username);
			let count = 0;
			const params = {
				ExpressionAttributeValues: {
					":searchValue": username,
				},
				FilterExpression: "contains (userId, :searchValue)",
				ProjectionExpression: "userId, firstName, lastName, email, username",
				TableName: "users",
			};
			await dynamodb
				.query(params, (err, data) => {
					if (err) {
						reject(err);
					} else {
						count += data.Count;
					}
				})
				.promise();

			//Generate a new username composed by: firstName + (number of occurances + 1)
			listSuggestion.push(nameTrimed + ++count);
			resolve(listSuggestion);
		}
	});
};

const existUsername = (username: string) => {
	return new Promise<boolean>((resolve, reject) => {
		const params = {
			ExpressionAttributeValues: {
				":searchValue": username,
			},
			KeyConditionExpression: "userId = :searchValue",
			ProjectionExpression: "userId, firstName, lastName, email",
			TableName: "users",
		};
		dynamodb.query(params, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data.Items.length > 0);
			}
		});
	});
};

const validateFormData = (data: FormData) => {
	return new Promise<string[]>(async (resolve, reject) => {
		let dataSanatized = sanitizeHtml(data);
		let { firstName, lastName, email, username } = dataSanatized;
		if (
			typeof firstName !== "string" ||
			typeof lastName !== "string" ||
			!isValideEmail(email)
		) {
			reject({
				error: new Error(
					`Verifique se o campo 'firstName' e 'lastName' sao do tipo 'string' e se o email é válido`
				),
				code: 400,
			});
			return;
		} else {
			await existUsername(username)
				.then(async (exist) => {
					if (exist) {
						await generateUsernameSuggestions(dataSanatized)
							.then(resolve)
							.catch(reject);
					} else {
						resolve([]);
					}
				})
				.catch(reject);
		}
	});
};

const createUser = (
	event: APIGatewayProxyEvent,
	context: Context,
	callback: Callback
) => {
	const requestBody = JSON.parse(event.body) as FormData;

	/**
	 * Function called when the user has been successfully created
	 */
	const successfullyCreated = (res: CreatedUser) => {
		callback(null, {
			statusCode: 201,
			body: JSON.stringify({
				message: `User sucessfully created`,
				userId: res.userId,
			}),
		});
	};

	/**
	 * Function called when occurs any exception creating the user
	 */
	interface ErrorCreateUser {
		error: Error;
		code: number;
	}
	const failedCreating = (err: ErrorCreateUser) => {
		const { code, error } = err;
		callback(null, {
			statusCode: code || 500,
			body: JSON.stringify({
				message: `Unable to submit user`,
				error: error.message,
			}),
		});
	};
	validateFormData(requestBody)
		.then((usernameSuggestions) => {
			if (usernameSuggestions.length) {
				callback(null, {
					statusCode: 200,
					body: JSON.stringify({
						usernameSuggestions,
					}),
				});
			} else {
				submitUser(userInfo(requestBody))
					.then(successfullyCreated)
					.catch(failedCreating);
			}
		})
		.catch(failedCreating);
};

export { createUser, existUsername };
