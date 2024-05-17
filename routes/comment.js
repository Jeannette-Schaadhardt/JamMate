const express = require('express');
const router = express.Router();

const { createComment, deleteComment } = require('../model/mComment.js');

// Handle updates to the user bio
router.post('/:postId', async (req, res) => {
    try {
        createComment(req.params.postId, req.body)
        res.json(req.body)
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
