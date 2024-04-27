import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer'; // Import Multer
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from 'express-openid-connect';
import session from 'express-session';
import { postUser, createPost, getPosts } from './model/mUser.js';
import { getSecret, getConfig } from './state.js';

const app = express();
const login = express.Router();
const upload = multer({ dest: 'uploads/' }); // Configure multer with a files destination

const PORT = process.env.PORT || 9001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const secret = getSecret(10);
const config = getConfig(secret);

login.use(bodyParser.json());
login.use('/login', login);// req.isAuthenticated is provided from the auth router

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(auth(config));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from uploads directory



// Stores browser session
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true
}));


app.post('/create-post', upload.single('media'), async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({error: 'Not authenticated'});
    }
    const content = req.body.content;
    const file = req.file;  // Multer processes the file upload
    const userId = req.oidc.user.sub;

    try {
        const post = await createPost(userId, content, file);
        res.json({
            content: content,
            filePath: file ? `/uploads/${file.filename}` : null,
            fileType: file ? file.mimetype : null
        });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).send({error: 'Failed to create post'});
    }
});

/**
 * Handles homepage redirection
 */
app.get('/', (req, res) => {
    handleAuthenticationFlow(req, res, "home")
});

/**
 * Handles main feed redirection
 */
app.get('/mainFeed', async (req, res) => {
    try {
        const posts = await getPosts();
        //res.json(posts);
        //console.log("posts = ", posts);
        res.render('mainFeed', { posts: posts });
    } catch (err) {
        console.error('Error getting post:', err);
        res.status(500).send({error: 'Failed to create post'});
    }
});

/**
 * Handles profile page redirection.
 */
app.get('/profile', (req, res) => {
    handleAuthenticationFlow(req, res, "profile")
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
            res.render(destination, user);
        });
    }

    // User is not logged in so redirect home with undefined data and false log in status
    else {
        let data = { "user": req.oidc.user, "jwt": req.oidc.idToken,  "loggedIn": false };
        res.render('homeLoggedOut', data);
    }
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
