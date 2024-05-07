const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createPost, getPost, deletePost } = require('../model/mPost.js');

const upload = multer({ dest: 'uploads/' }); // Configure multer with a files destination

router.post('/', upload.single('media'), async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({error: 'Not authenticated'});
    }
    const q = req.body;
    const oidc = req.oidc.user;
    try {
        const post = await createPost(oidc.sub, q.postText, req.file,
            oidc.nickname, q.instrument, q.genre, q.skillLevel, oidc.location);
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

    try {
        const post = await getPost(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        // Check if the logged-in user is the owner of the post
        if (post.userId !== userId) {
            return res.status(403).send('Unauthorized to delete this post');
        }
        await deletePost(postId);
        res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;