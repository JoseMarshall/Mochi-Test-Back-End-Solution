import axios from "axios";

it("should get a 200 OK Status Code", async () => {
	const body = {
		username: "josemar10",
	};
	const res = await axios.post(
		`https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev/sendEmail`,
		body
	);
	expect(res.status).toBe(200);
});

it("should get a 400 Status Code, which means Email or pdf link not registered", async () => {
	const body = {
		username: "xxxxxxxxxxxx",
	};
	axios
		.post(
			`https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev/sendEmail`,
			body
		)
		.catch((res) => {
			expect(res.status).toBe(400);
		});
});
