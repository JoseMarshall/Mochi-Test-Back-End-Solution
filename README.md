# API GATEWAY

#### API Base URL: [https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev](https://44qss80noj.execute-api.us-east-1.amazonaws.com/dev)

 
#### These are the enpoints of the API:
## Create User

### HTTP Method: POST

### Endpoint: /createUser

##### Description: 
Add a new user to the application

##### Consumes: 
This API call consumes the following media types via the Content-Type request header: application/json

##### Request body: 
(required) — User object that needs to be added to the application (password is optional) , client must send a request body as follow:
```

    {
        "firstName": "Josemar",
        "lastName": "Hebo",
        "email": "emailexample@example.com",
        "username": "josemar10",
        "password": "1234"
    }
```
##### Produces: 
This API call produces the following types according to the Accept request header: application/json

##### Responses: 
###### 201 - Successfully Created
``` 
{ 
   "message":"User successfully created", 
   "userId":"josemar10" 
}
```

###### 200 - Username Suggestions (when the username submitted already exists)
```
    {
        "usernameSuggestions": [
            "Josemar",
            "Hebo",
            "Josemar28"
        ]
    }
```

###### 400 - Unable to submit User
```
    {
        "message": "Unable to submit user",
        "error": "Verifique se o campo 'firstName' e 'lastName' 
                  sao do tipo 'string' e se o email é válido"
    }
```

###### 500 - Internal Server Error


## Upload a PDF

### HTTP Method: POST

### Endpoint: /uploadPdf

##### Description: 
Upload a PDF, which attaches it to a created user and then sends the user an email, the application uses the follow email: allpharma.enterprise@gmail.com

##### Consumes: 
This API call consumes the following media types via the Content-Type request header: application/json

##### Request body: 
(required) — "pdf" - The Base64 file representation. "username" - The username to attaches the file to. Client must send a request body as follow:

```
 { 
     "username": "josemar10", 
     "pdf": "JVBERi0xLjMKJbrfrOAKMyAwIG9iagoPC9UeXBlI
C9QYWdlCi9QYXJlbnQgMSAwIFIKL1Jlc291cmNlcyAyIDAgUgovTWVkaWFCb3ggWzAg
 MCA1OTUuMjc1NTkwNTUxMTgxMDM5NyA4NDEuODg5NzYzNzc5NTI3NDcwNF0KL0NvbnRlbnRzIDQg
MCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggMjI2Mwo+9PT09PT09PT09PT09PT09PT0
9PT09PT09PT09PT0pIFRqCkVUCkJUCi9GOSAxMiBUZgoxMy43OTk5OTk5OTk5OTk5OTg5IFRMC
jAgZwoyOC4zNDY0NTY2OTI5MTMzODUyIDYyOS4yOTEzMzg1ODI2NzcwOTkxIFRkCihDb2JyYXI....." 
}
```

##### Produces: 
This API call produces the following types according to the Accept request header: application/json

##### Responses: 
###### 200 - PDF Successfully uploaded, and email successfuly sent 
```
{ 
    "message": "Email enviado com sucesso, por favor checa a sua caixa de entrada", 
    "linkToPdf": "https://mochi-pdfs.s3.amazonaws.com/PDF_ID_EXAMPLE.pdf" 
}
```
###### 403 - Failed uploading the file, user not authorized
```
    {
        "error": "Failed uploading the file"
    }
```
###### 400 - Ficheiro não suportado
```
    {
        "error": "Tipo de ficheiro não suportado, apenas suportado ficheiros '.pdf'"
    }
```

###### 500 - Internal Server Error


## Re-send Email

### HTTP Method: POST

### Endpoint: /sendEmail

##### Description: 
Re-send the welcome email to a user, the application uses the follow email:
 [allpharma.enterprise@gmail.com](allpharma.enterprise@gmail.com)
##### Consumes: 
This API call consumes the following media types via the Content-Type request header: application/json

##### Request body: 
(required) — "username" - The username that has a registered email. Client must send a request body as follow: 
```

    {
        "username": "josemar10"
    }
```
##### Produces: 
This API call produces the following types according to the Accept request header: application/json

##### Responses:
###### 200 - Email successfuly sent 
```
{
    "message": "Email enviado com sucesso, por favor checa a sua caixa de entrada",
    "response": {
        "accepted": [
            "emailexample@example.com"
        ],
        "rejected": [],
        "envelopeTime": 366,
        "messageTime": 535,
        "messageSize": 2870,
        "response": "250 2.0.0 OK 1611833426 9sm3259944qtr.64 - gsmtp",
        "envelope": {
            "from": "",
            "to": [
                "emailexample@example.com"
            ]
        },
        "messageId": "0fdb3da0-a836-7f8e-7752-afcf73eb8685@169.254.236.93"
    }
}
```
###### 400 - Email or pdf link not registered
```
    {
        "message": "Alguma coisa correu mal enquanto tentava enviar o email",
        "response": {
            "error": "Link do pdf não registrado, por faça o upload de algum ficheiro .pdf"
        }
    }
```
