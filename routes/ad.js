const express = require('express');
const { handleAuthenticationFlow } = require('../functions');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { createAd, getAd, deleteAd, deleteAllAds } = require('../model/mAd.js');
const { getUsers} = require('../model/mUser.js');

// Ad
router.get('/', (req, res) => {
    handleAuthenticationFlow(req, res, "adpage");
    //res.send('this is an ad');
});

router.post('/', upload.single('media'), async (req, res) => {
    console.log("Received fields:", req.body);  // Log form fields to ensure data is coming in correctly
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({error: 'Not authenticated'});
    }
    const q = req.body;
    const oidc = req.oidc.user;
    try {
        const ad = await createAd(oidc.sub, q.content, req.file);
        res.json(ad);
    } catch (err) {
        console.error('Error creating ad:', err);
        res.status(500).send({error: 'Failed to create ad'});
    }
});

router.delete('/:adId', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).send('Not authenticated');
    }
    const adId = req.params.adId; // Extracting adId from the URL

    try {
        const ad = await getAd(adId);
        if (!ad) {
            return res.status(404).send('Ad not found');
        }
        if (ad.userId !== req.oidc.user.sub) { // Checking ownership
            return res.status(403).send('Unauthorized to delete this ad');
        }
        await deleteAd(adId);
        res.status(200).send({ message: 'Ad deleted successfully' });
    } catch (error) {
        console.error('Error deleting ad:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/all/:userId', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).send('Not authenticated');
    }
    const targetUserId = req.params.userId; // UserId of the ads to delete.
    const userId = req.oidc.user.sub; // User ID of the currently logged-in user

    try {
        let userEntities = await getUsers(null, null, userId);
        // Check if the logged-in user is the owner of the ad
        if (targetUserId !== userEntities[0].user.nickname) {
            return res.status(403).send('Unauthorized to delete ads');
        }
        await deleteAllAds(userEntities[0].user.nickname);
        res.status(200).send({ message: 'Ad deleted successfully' });
    } catch (error) {
        console.error('Error deleting ad:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;