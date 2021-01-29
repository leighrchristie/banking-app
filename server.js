const { auth } = require('express-openid-connect')
const express = require('express')
const app = express()
const { sequelize, User, Friend } = require('./models')
const Email = require('./email')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

var PORT = process.env.PORT || 3000

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: '43fe55766bea3d31fd0ef76c8de6ce68740c25cd9042750536eb6b0cdc40cf18',
    baseURL: 'http://localhost:3000',
    clientID: 'IycyB7xCXtYehzEFnGUVNdWa2hFivbyB',
    issuerBaseURL: 'https://dev-ga5nq384.eu.auth0.com'
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config))

//body of requests should be parsed
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')

// req.isAuthenticated is provided from the auth router
app.get('/', async (req, res) => {
    if (req.oidc.isAuthenticated()) {
        var user = await User.findOne({
            where: {
                email: req.oidc.user.email
            }
        })
        if (user == null) {
            user = await User.create({
                name: req.oidc.user.nickname, 
                email: req.oidc.user.email, 
                balance: 500
            })
        }
        console.log(req.oidc.user)
        console.log(user)
        res.redirect("user")
    } else {
        res.send('You are not logged in.')
    }
})

//Getting user home page
app.get("/user", async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        res.sendStatus(404)
    } else {
        const user = await User.findOne({
            where: {
                email: req.oidc.user.email
            }
        })

        const friends = await Friend.findAll({
            where: {
                UserId: user.id
            }
        })
        res.render("user", {user, friends})
    }
})

//Sending invitation email to friend
app.post('/user/:id/invite-friend', async (req,res) => {
  const user = await User.findByPk(req.params.id)
  const link = 'http://localhost:3000/user/' + user.id + '/invite-friend'
  const body = 'Hi! ' + user.name + ' has invited you to be their friend on Cash Flow. Follow this link to accept: ' + link
  const subject = "Cash Flow Friend Request"
  const email = new Email(req.body.email, body, subject)
  res.sendStatus(200)
})

//Getting add friend form
app.get('/user/:id/invite-friend', async (req,res) => {
    const id = req.params.id
    res.render("invite", {id})
})

//Creating a new friend
app.post('/user/:id/add-friend', async (req,res) => {
    const friend = await Friend.create({email: req.body.email, bank: req.body.bank, UserId: req.params.id})
    res.status(200).send(friend)
})

//Paying a user
app.post('/pay', async (req,res) => {
    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    })
    
    const amount = req.body.amount

    if (user == []) {
        res.sendStatus(404)
    } else if (typeof amount != "number") {
        res.sendStatus(400)
    } else {
        const balance = user.balance + amount
        console.log(balance)
        user.update({balance: balance })
        const body = "Hi! you have recieved a payment of: " + amount
        const email = new Email(user.email, body, "Cash Flow Reciept")
        res.sendStatus(200)
    }   
}) 

app.listen(PORT, async () => {
    await sequelize.sync()
    console.log('web server running on port 3000')
})