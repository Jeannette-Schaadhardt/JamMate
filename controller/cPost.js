import express from 'express';
import { testJWT } from '../functions.js';
import bodyParser from 'body-parser';
import multer from 'multer'; // Import Multer

const router = express.Router();
const jwt = testJWT();
//console.log(jwt);


const upload = multer({ dest: 'uploads/' }); // Configure multer with a files destination

router.use(bodyParser.json());

router.post('/create-post', jwt, upload.single('media'), async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({error: 'Not authenticated'});
    }
    const content = req.body.content;
    const file = req.file;  // Multer processes the file upload
    const userId = req.oidc.user.sub;
    const nickname = req.oidc.user.nickname;

    try {
        const post = await createPost(userId, nickname, content, file);
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

router.get('/', (req, res) => {
    res.send('youre in /post');
})
