import { postUser } from './model/mUser.js';
import { getSecret , getConfig } from './state.js';
import { fileURLToPath } from 'url';
import { auth } from 'express-openid-connect';
import session from 'express-session';

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
app.set('view engine', 'ejs');
const PORT = process.env.PORT || 9001;

// https://stackoverflow.com/questions/75004188/what-does-fileurltopathimport-meta-url-do
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const login = express.Router();
const secret = getSecret(10); // Generates state of a logged-in User
const config = getConfig(secret);

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(bodyParser.json());
app.use(auth(config));

login.use(bodyParser.json());
login.use('/login', login);// req.isAuthenticated is provided from the auth router

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
}));
/**
 * Handles homepage redirection
 */
app.get('/', (req, res) => {
    handleAuthenticationFlow(req, res, "home")
});

/**
 * Handles profile page redirection.
 */
app.get('/profile', (req, res) => {
    handleAuthenticationFlow(req, res, "profile")
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

/**
 * Handles re-authentication when trying to access webpages
 *
 * @param {*} req - holds user object and id
 * @param {*} res
 * @param {*} destination - Where we want to send user upon authentication.
 */
function handleAuthenticationFlow(req, res, destination) {
    const filePath = path.resolve(__dirname, './views/index.html');

    // User is logged in
    if (req.oidc.isAuthenticated()) {
        let user = { "user": req.oidc.user, "jwt": req.oidc.idToken,  "loggedIn": true };
        postUser(user)
        .then(result => {
            const user = result.data;
            console.log(user);
            res.render(destination, result.data);
        });
    }

    // User is not logged in so redirect home with undefined data and false log in status
    else {
        let data = { "user": req.oidc.user, "jwt": req.oidc.idToken,  "loggedIn": false };
        res.render('home', data);
    }
}