const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')
const mailComposer = require('nodemailer/lib/mail-composer')

class Email {
    static SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.modify',
'https://www.googleapis.com/auth/gmail.compose','https://www.googleapis.com/auth/gmail.send']
    static TOKEN_PATH = 'token.json';

    constructor(to,text,subject) {
        const message = new mailComposer({
            to: to,
			text: text,
			subject: subject,
            textEncoding: "base64"
        })

        message.compile().build((err, msg) => {
			if (err){
				return console.log('Error compiling email ' + error);
			} 
		
			this.encodedMessage = Buffer.from(msg)
			  .toString('base64')
			  .replace(/\+/g, '-')
			  .replace(/\//g, '_')
              .replace(/=+$/, '')

		})
        
        fs.readFile('credentials.json', (err, content) => {
            if(err){
                return console.log('Error loading client secret file:', err);
            }
        
            Email.authorize(JSON.parse(content), (auth) => { this.send(auth) });
        })
    } 

    static authorize(credentials,callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

        fs.readFile(Email.TOKEN_PATH, (err, token) => {
            if(err){
                return Email.getNewToken(oAuth2Client, callback)
            }
            oAuth2Client.setCredentials(JSON.parse(token))
            callback(oAuth2Client)
        })
    }

    static getNewToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: Email.SCOPES,
        })
        
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close()
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    return console.error('Error retrieving access token', err)
                }
                oAuth2Client.setCredentials(token);
            
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) {
                        return console.error(err)
                    }
                    
                    console.log('Token stored to', TOKEN_PATH);
                })
                
                callback(oAuth2Client);
            })
        })
    }

    send(auth) {
        const gmail = google.gmail({version: 'v1', auth})

        gmail.users.messages.send({
            userId: "cash.flow.glm@gmail.com",
            resource: {
				raw: this.encodedMessage,
			}
        }, (err, result) => {
            if(err) {
                console.log('The API returned an error: ' + err);
            }
        })
    }


}

module.exports = Email
