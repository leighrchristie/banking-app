const {google} = require('googleapis');
const mailComposer = require('nodemailer/lib/mail-composer');

class Email {

    constructor(to,subject,text,auth) {
        this.gmail = google.gmail({version: 'v1', auth})

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
			  .replace(/=+$/, '');
		})
    }

    send() {
        this.gmail.users.messages.send({
            userId: "cash.flow.glm@gmail.com",
            resource: {
				raw: this.encodedMessage,
			}
        })
    }

}