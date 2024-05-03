const express = require('express');
const { handleAuthenticationFlow } = require('../functions');
const router = express.Router();
const multer = require('multer');
const { createPost, getPost, getPosts, searchPosts } = require('../model/mPost.js');
const { postUser } = require('../model/mUser.js');

const upload = multer({ dest: 'uploads/' }); // Configure multer with a files destination

router.post('/', upload.single('media'), async (req, res) => {
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

router.delete('/:postId', async (req, res) => {
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

module.exports = router;