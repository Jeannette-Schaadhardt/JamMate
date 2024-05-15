const express = require('express');
const { getUserInfo, updateUserInfo } = require('../model/mUser');
const { getPosts } = require('../model/mPost');
const { getAds } = require('../model/mAd');
const router = express.Router();

// Middleware to ensure the user is authenticated
function isAuthenticated(req, res, next) {
    if (!req.oidc.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

// Display the user's profile
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userEntity = await getUserInfo(req.oidc.user.sub);
        if (!userEntity) {
            return res.status(404).send('User not found');
        }
        // Fetch only the posts for the logged-in user
        const posts = await getPosts(req.oidc.user.sub);
        const ads = await getAds();
        res.render('profilepage', {
            user: userEntity.user,
            posts: posts,
            ads: ads,                    // Include ads here
            loggedIn: req.oidc.isAuthenticated()
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Redirect to edit bio page
router.get('/edit', isAuthenticated, async (req, res) => {
    const userInfo = await getUserInfo(req.oidc.user.sub);
    if (!userInfo) {
        return res.status(404).send('User not found');
    }
    // Pass the loggedIn status when rendering the editBio template
    res.render('editBio', {
        user: userInfo,
        loggedIn: req.oidc.isAuthenticated() // Ensures that the 'loggedIn' variable is defined
    });
});

// Handle updates to the user bio
router.post('/update-bio', isAuthenticated, async (req, res) => {
    const { nickname, description, skillLevel, location, instrument } = req.body;
    try {
        await updateUserInfo(req.oidc.user.sub, {
            nickname,
            description,
            skillLevel,
            location,
            instrument
        });
        res.redirect('/user');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;

