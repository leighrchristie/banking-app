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

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  console.log(req.oidc.user)
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
})

app.listen(PORT, () => console.log('web server running on port 3000'))