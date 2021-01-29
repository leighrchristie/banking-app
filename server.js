const { auth } = require('express-openid-connect')
const express = require('express')
const app = express()
const { sequelize, User } = require('./models')

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

// checks if user exists then req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
    if (req.oidc.isAuthenticated()) {
        const user = User.findAll({
            where: {
                email: req.oidc.user.email
            }
        })
        if (!user) {
            User.create({
                name: req.oidc.user.name,
                email: req.oidc.user.email
            })
            const user = User.findAll({
                where: {
                    email: req.oidc.user.email
                }
            })
        }
        console.log(req.oidc.user)
        console.log(user)
        res.redirect("user_page")
        res.send('You are logged in')
    } else {
        res.send('You are not signed up!')
    }
})

app.get("/user_page", async (req, res) => {
  console.log(req.oidc.user)
  res.render("user_page")
})

// Puts the friends into the user page
app.get('/user/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id)
    const friends = await Friend.findAll({
        include: [
            {model: Friend, as: 'friends'}
        ]
    })
    res.render('/user', {user, friends})
})

app.listen(PORT, async () => {
    await sequelize.sync()
    console.log('web server running on port 3000')
})