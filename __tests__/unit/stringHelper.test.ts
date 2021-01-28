import {
	isValideEmail,
	removeEspecialChars,
	replaceAll,
	sanitizeHtml,
} from "../../src/helpers";

it("should replace all comas by white space", () => {
	const mystr = "josemar,caculo,hebo";
	expect(replaceAll(mystr, ",", " ")).not.toContain(",");
});

it("should replace all special chars in string", () => {
	const mystr = "a@b#c%1*2+3";
	expect(removeEspecialChars(mystr)).not.toContain("@");
});

it("should validate the email", () => {
	const mystr = "example.email@example.com";
	const mystr2 = "example.emailexample.com";
	expect(isValideEmail(mystr)).toBeTruthy();
	expect(isValideEmail(mystr2)).toBeFalsy();
});

it("should sanitize the string, removing undesired tags", () => {
	const data = {
		email: `<script>
        example.email@example.com
        </script>`,
		firstName: "",
		lastName: "",
		username: "",
		password: "",
	};
	expect(sanitizeHtml(data).email).not.toContain("script");
});
