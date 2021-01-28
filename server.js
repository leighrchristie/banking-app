const { auth } = require('express-openid-connect')
const express = require('express')
const app = express()

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'https://localhost:3000',
  clientID: 'IycyB7xCXtYehzEFnGUVNdWa2hFivbyB',
  issuerBaseURL: 'https://dev-ga5nq384.eu.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.use(express.json())

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.listen(3000, () => console.log('web server running on port 3000'))