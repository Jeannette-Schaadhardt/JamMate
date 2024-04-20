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

app.get('/', (req, res) => {
        const filePath = path.resolve(__dirname, './views/index.html');
        const homePage = path.resolve(__dirname, './views/home.ejs');

        // User is logged in
        if (req.oidc.isAuthenticated()) {
            let user = { "user": req.oidc.user, "jwt": req.oidc.idToken };

            postUser(user)
            .then(result => {
                const user = result.data;
                console.log(user);
                res.render('home', result.data);
            });


        }
        // User is not logged in
        else {
            res.sendFile(filePath);
        }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});