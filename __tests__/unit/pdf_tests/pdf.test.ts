import axios from "axios";
import * as faker from "faker";
import * as fs from "fs";

it("should get a 200 OK Status Code, which means PDF Successfully uploaded, and email successfuly sent", async () => {
	const file = fs.readFileSync(`${__dirname}/myPdfFile.pdf`);
	const encodedFile = file.toString("base64");
	const body = {
		username: "josemar10",
		pdf: encodedFile,
	};
	const res = await axios.post(
		`https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev/uploadPdf`,
		body
	);
	expect(res.status).toBe(200);
});

it("should get a 403 Status Code, which means Failed uploading the file, user not authorized ", async () => {
	const body = {
		username: "xxxxxxxxxxxx",
		pdf: "",
	};
	axios
		.post(
			`https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev/uploadPdf`,
			body
		)
		.catch((res) => {
			expect(res.status).toBe(403);
		});
});

it("should get a 400 Status Code, which means ficheiro não suportado", async () => {
	const body = {
		username: "josemar10",
		pdf: "sjusryeyrudfyjeiydkgjkfgjkfjkgjk",
	};
	axios
		.post(
			`https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev/uploadPdf`,
			body
		)
		.catch((res) => {
			expect(res.status).toBe(400);
		});
});
