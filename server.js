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
const upload = multer({ dest: 'uploads/' }); // Configure multer with a files destination

const PORT = process.env.PORT || 9001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const secret = getSecret(10);
const config = getConfig(secret);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(auth(config));
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from uploads directory

app.get('/', (req, res) => {
    const filePath = path.resolve(__dirname, './views/index.html');

    if (req.oidc.isAuthenticated()) {
        let user = { "user": req.oidc.user, "jwt": req.oidc.idToken };
        postUser(user).then(result => {
            const user = result.data;
            console.log(user);
            res.render('home', result.data);
        });
    } else {
        res.sendFile(filePath);
    }
});

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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
