const express = require('express');
const { handleAuthenticationFlow } = require('../functions');
const router = express.Router();

// Profile
router.get('/', (req, res) => {
    handleAuthenticationFlow(req, res, "profilepage");
});

router.get('/edit', (req, res) => {
    res.send('edit your profile');
});

router.get('/:id', (req, res) => {
    res.send(`Get User with ID ${req.params.id}`);
});

module.exports = router;