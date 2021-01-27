import * as sanitizer from "sanitize-html";
import { FormData } from "../models";

const replaceAll = (
	str: string,
	search: string,
	replaceValue: string
): string => {
	return str.replace(new RegExp("[" + search + "]", "g"), replaceValue);
};

const removeEspecialChars = (str: string): string => {
	return str.replace(new RegExp('[!@#$%^&*(),.?":{}|<> ]', "g"), "");
};
const isValideEmail = (email: string): boolean => {
	const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regex.test(String(email).toLowerCase());
};

const sanitizeHtml = (data: FormData): FormData => {
	const newData = {
		firstName: "",
		lastName: "",
		email: "",
		username: "",
		password: "",
	};
	for (const key in data) {
		const element = data[key];
		newData[key] = sanitizer(element);
	}
	return newData;
};
export { replaceAll, removeEspecialChars, isValideEmail, sanitizeHtml };
