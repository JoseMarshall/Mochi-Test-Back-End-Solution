import axios from "axios";
import * as faker from "faker";

it("should get a 201 Created Status Code", async () => {
	const body = {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName(),
		email: faker.internet.email(),
		username: faker.name.firstName(),
		password: faker.random.alphaNumeric(),
	};
	const res = await axios.post(
		`https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev/createUser`,
		body
	);
	expect(res.status).toBe(201);
});

it("should get a list with usernames suggestions", async () => {
	const body = {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName(),
		email: faker.internet.email(),
		username: "josemar10",
		password: faker.random.alphaNumeric(),
	};
	const res = await axios.post(
		`https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev/createUser`,
		body
	);
	expect(res.data.usernameSuggestions).toBeInstanceOf(Array);
	expect(res.data.usernameSuggestions.length).toBeGreaterThan(0);
});

it("should get a 400 Status Code, which means user couldnt be submited, Cause email is not valid", async () => {
	const body = {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName(),
		email: "email_not_valid",
		username: "josemar10",
		password: faker.random.alphaNumeric(),
	};
	axios
		.post(
			`https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev/createUser`,
			body
		)
		.catch((res) => {
			expect(res.status).toBe(400);
		});
});
