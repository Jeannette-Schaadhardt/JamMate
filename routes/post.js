const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage()
const { postUser } = require('../model/mUser.js');
const { createPost, getPost, deletePost, deleteAllPosts } = require('../model/mPost.js');
const { getUsers} = require('../model/mUser.js');

const upload = multer({ storage: storage });

router.post('/', upload.single('media'), async (req, res) => {
    console.log("Received fields:", req.body);  // Log form fields to ensure data is coming in correctly
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({error: 'Not authenticated'});
    }
    const q = req.body;
    const oidc = req.oidc.user;
    try {
        const post = await createPost(oidc.sub, q.content, req.file,
            oidc.nickname, q.instrument, q.genre, q.skillLevel, oidc.location);
        res.json(post);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).send({error: 'Failed to create post'});
    }
});

router.delete('/:postId', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).send('Not authenticated');
    }
    const postId = req.params.postId; // Extracting postId from the URL

    try {
        const post = await getPost(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        if (post.userId !== req.oidc.user.sub) { // Checking ownership
            return res.status(403).send('Unauthorized to delete this post');
        }
        await deletePost(postId);
        res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/all/:userId', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).send('Not authenticated');
    }
    const targetUserId = req.params.userId; // UserId of the posts to delete.
    const userId = req.oidc.user.sub; // User ID of the currently logged-in user

    try {
        let userEntities = await getUsers(null, null, userId);
        // Check if the logged-in user is the owner of the post
        if (targetUserId !== userEntities[0].user.nickname) {
            return res.status(403).send('Unauthorized to delete posts');
        }
        await deleteAllPosts(userEntities[0].user.nickname);
        res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;