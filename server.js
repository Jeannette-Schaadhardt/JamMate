const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { auth } = require('express-openid-connect');
const session = require('express-session');
const { Datastore } = require("@google-cloud/datastore");
const { handleAuthenticationFlow, getSecret, getConfig } = require('./functions.js');

const app = express();
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 9001;
const userRouter = require('./routes/user.js');  // router for User
const postRouter = require('./routes/post.js');  // router for Post

// Configure Datastore
const datastore = new Datastore({
    projectId: 'jammate-cs467', // Replace with your actual project ID
});

const POST_KIND = 'Post'; // Define a kind for the Datastore entries
const filePath = path.resolve(__dirname, './views/index.ejs');
const secret = getSecret(10);
const config = getConfig(secret);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(auth(config));
app.use('/uploads', express.static(path.join(filePath, 'uploads'))); // Serve static files from uploads directory
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    next();
  });
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    handleAuthenticationFlow(req, res, "homepage");
});

/* ==================== SERVER  ==================== */
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
/* ==================== SERVER  ==================== */


