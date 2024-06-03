const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getUserInfo, updateUserInfo, getUsers } = require('../model/mUser');
const { saveProfilePicture, saveCoverPhoto } = require('../model/storageService');
const { getPosts } = require('../model/mPost');
const { getAds } = require('../model/mAd');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
        const posts = await getPosts({userId: req.oidc.user.sub});
        const ads = await getAds();
        res.render('profilepage', {
            user: userEntity.user,
            posts: posts,
            ads: ads,
            loggedIn: req.oidc.isAuthenticated()
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Display the user's profile
router.get('/edit', isAuthenticated, async (req, res) => {
    try {
        const userEntity = await getUserInfo(req.oidc.user.sub);
        if (!userEntity) {
            return res.status(404).send('User not found');
        }
        res.render('editBio', {
            user: userEntity.user,
            loggedIn: req.oidc.isAuthenticated()
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Display the user's profile
router.get('/:userId', isAuthenticated, async (req, res) => {
    const userId = req.params.userId;
    try {
        const userEntity = await getUserInfo(userId);
        if (!userEntity) {
            return res.status(404).send('User not found');
        }
        const posts = await getPosts({userId});
        const ads = await getAds({userId});
        res.render('visitUserProfile', {
            user: userEntity.user,
            posts: posts,
            ads: ads,
            loggedIn: req.oidc.isAuthenticated()
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to update the user's bio information
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

// Route to handle profile picture update
router.post('/update-profile-picture', upload.single('profilePicture'), isAuthenticated, async (req, res) => {
    try {
        // Get user ID from the authentication context
        const userId = req.oidc.user.sub;
        // Save the new profile picture and get the URL
        const newProfilePicUrl = await saveProfilePicture(userId, req.file);
        // Update user info in the database
        await updateUserInfo(userId, { profilePicture: newProfilePicUrl });
        res.redirect('/user'); // Or return JSON response
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/update-cover-photo', upload.single('coverPhoto'), isAuthenticated, async (req, res) => {
    const userId = req.oidc.user.sub;
    const newCoverPhotoUrl = await saveCoverPhoto(userId, req.file);
    await updateUserInfo(userId, { coverPhoto: newCoverPhotoUrl });
    res.redirect('/user');
});

module.exports = router;



