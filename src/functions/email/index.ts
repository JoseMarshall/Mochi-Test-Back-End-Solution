import { createTransport } from 'nodemailer';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { google } from "googleapis";
import {CreatedUser, PdfAttach,} from '../../models'
import { dynamodb } from '../../aws'
import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda'

const OAuth2 = google.auth.OAuth2;

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const refreshToken = process.env.REFRESH_TOKEN

const myOAuth2Client = new OAuth2(
    clientId,
    clientSecret,
    process.env.REDIRECT_URI
)

myOAuth2Client.setCredentials({
    refresh_token: refreshToken
});
const accessToken = myOAuth2Client.getAccessToken()

const transporter = createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_ADDRESS, 
        type: 'OAuth2',
        accessToken,
        clientId,
        clientSecret,
        refreshToken

    }
})

const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: '',
    subject: 'Bem vindo à Mochi Noir, Lda',
    html: ''
}

/***
 * @param context {Object} - An object that contains the keys to be embeded into email template 
 * Render the email's template with the data comming from the context
 * @returns {result} An HTML
 * 
 */
const loadTemplate = (name: string, context: CreatedUser): string => {
    let source = readFileSync(__dirname + '/' + name, { encoding: 'utf-8' })
    let template = compile(source)
    let result = template(context)
    return result;
}

/***
 * @param destiny {String} - the destinatary of email 
 * @param hypertext {String} - the HTML to be sent in the email's body
 *  
 * Send an email to {destiny} containing the {hypertext}
 */
const send = (destiny: string, hypertext: string) => {
    mailOptions.to = destiny
    mailOptions.html = hypertext

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions)
            .then(resolve)
            .catch(reject)
    })

};

function sendWelcomeEmail(user: CreatedUser) {
    const HTML = loadTemplate('welcome.hbs', user); //The html to be send in the body of email
    return  send(user.email, HTML)
}

const successfullySent = (response) => {
    return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Email enviado com sucesso, por favor checa a sua caixa de entrada',
      response
    })
  
  }};
  
  const failedSending = (response) => {
    return {
    statusCode: 500,
    body: JSON.stringify({
      message: 'Alguma coisa correu mal enquanto tentava enviar o email',
      response
    })
  
  }};

const reSendEamil = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    const requestBody = JSON.parse(event.body) as PdfAttach;
    const params = {
      TableName: 'users',
      Key: {
        'userId': requestBody.userId
      },
      ProjectionExpression: `userId,
                            firstName,
                            lastName,
                            email,
                            linkToPdf,
                            username,
                            createdAt,`
    };
    dynamodb.get(params)
    .promise()
    .then((data) => {
      sendWelcomeEmail(data.Item as CreatedUser)
          .then((res)=>callback(null, successfullySent(res)))
          .catch((error) =>callback(error, failedSending(error)))
    })
    .catch((error) =>callback(error, failedSending(error)))
  
  }

export {sendWelcomeEmail, reSendEamil}
