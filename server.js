const { auth } = require('express-openid-connect')
const express = require('express')
const app = express()
const { sequelize, User } = require('./models')
const Email = require('./email')

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

// req.isAuthenticated is provided from the auth router
app.get('/', async (req, res) => {
    if (req.oidc.isAuthenticated()) {
        var user = await User.findAll({
            where: {
                email: req.oidc.user.email
            }
        })
        if (user == []) {
            user = await User.create({name: req.oidc.user.nickname, email: req.oidc.user.email})
        }
        console.log(req.oidc.user)
        console.log(user)
        res.send('You are logged in')
    } else {
        res.send('You are not signed up!')
    }
})

app.post('/users/:id/invite-friend', async (req,res) => {
  const user = await User.findByPk(req.params.id)
  const link = 'http://localhost:3000/' + user.id + '/add-friend'
  const body = 'Hi! ' + user.name + ' has invited you to be their friend on Cash Flow. Follow this link to accept: ' + link
  const subject = "Cash Flow Friend Request"
  const email = new Email("cash.flow.glm@gmail.com", body, subject)
  res.sendStatus(200)
})

app.listen(PORT, async () => {
    await sequelize.sync()
    console.log('web server running on port 3000')
})