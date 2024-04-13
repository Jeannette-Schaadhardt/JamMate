const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9001;
const login = express.Router();
app.use(bodyParser.json());
login.use(bodyParser.json());

// From Stack Overflow:
//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function getSecret(len) {
    let res = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let count = 0;
    while (count < len) {
        res += characters.charAt(Math.floor(Math.random() * charactersLength));
        count += 1;
    }
    return res;
}

let secret = getSecret(20);

// --------- auth0 authentication --------- //
const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: secret,
  baseURL: 'http://localhost:9001',
  clientID: 'm8ieh2LZtQAtr5AcFevaw99k6tZ3KqCw',
  issuerBaseURL: 'https://dev-gblxtkrkmbzldfsv.us.auth0.com'
};
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
login.use('/login', login);// req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

// --------------------------------------------- //


app.get('/', (req, res) => {
        const filePath = path.resolve(__dirname, './view/index.html');
        const homePage = path.resolve(__dirname, './view/home.html');

        // res.sendFile(filePath);
        //res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
        if (req.oidc.isAuthenticated()) {
            res.sendFile(homePage);
        }
        else {
            res.sendFile(filePath);
        }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});