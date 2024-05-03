const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fileURLToPath = require('url');
const { auth } = require('express-openid-connect');
const session = require('express-session');
const { Datastore } = require("@google-cloud/datastore");
const { handleAuthenticationFlow, getSecret, getConfig } = require('./functions.js');
const { postUser } = require('./model/mUser.js');
const { createPost, getPost, getPosts, searchPosts } = require('./model/mPost.js');

const app = express();
const PORT = process.env.PORT || 9001;

// Configure Datastore
const datastore = new Datastore({
    projectId: 'jammate-cs467', // Replace with your actual project ID
});

const POST_KIND = 'Post'; // Define a kind for the Datastore entries

const login = express.Router();
const upload = multer({ dest: 'uploads/' }); // Configure multer with a files destination

const filePath = path.resolve(__dirname, './views/index.ejs');

const secret = getSecret(10);
const config = getConfig(secret);

login.use(bodyParser.json());
login.use('/login', login); // req.isAuthenticated is provided from the auth router

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(auth(config));
app.use('/uploads', express.static(path.join(filePath, 'uploads'))); // Serve static files from uploads directory

app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    next();
  });

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
    const { content } = req.body;
    const file = req.file;
    const userId = req.oidc.user.sub;
    const nickname = req.oidc.user.nickname;
    try {
        const post = await createPost(userId, nickname, content, file);
        res.json({
            ...post,
            message: 'Post created successfully'
        });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).send({error: 'Failed to create post'});
    }
});

app.delete('/delete-post/:postId', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).send('Not authenticated');
    }
    const postId = req.params.postId;
    const userId = req.oidc.user.sub; // User ID of the currently logged-in user

    const postKey = datastore.key([POST_KIND, parseInt(postId)]);
    try {
        const [post] = await datastore.get(postKey);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        // Check if the logged-in user is the owner of the post
        if (post.userId !== userId) {
            return res.status(403).send('Unauthorized to delete this post');
        }
        await datastore.delete(postKey);
        res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route handlers
app.get('/', (req, res) => {
    handleAuthenticationFlow(req, res, "homepage")
});
app.get('/profile', (req, res) => {
    handleAuthenticationFlow(req, res, "profilepage")
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

