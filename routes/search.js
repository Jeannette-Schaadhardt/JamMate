const express = require('express');
const router = express.Router();
const { getPosts } = require('../model/mPost.js');
const { getUsers } = require('../model/mUser.js');
const { authenticateUser} = require('../functions.js');

router.get('/', async(req, res) => {
    let loggedIn = false;
    let user;
    let postData = {
        userId: null,
        postId: null,
        instrument: null,
        genre: null,
        skillLevel: null,
        descriptor: null,
        lat: null,
        lon: null,
        rangeInMiles : null,
        start_date: null,
        end_date: null
    }
    let userRange = null;
    // We want to use our user's location to perform the range calculations.
    if (req.oidc.isAuthenticated()) {
        const users = await getUsers(null, null, req.oidc.user.sub)
        if (users.length>0) {
            user=users[0].user;
            if (user.location) {
                postData.lat = user.location[0];
                postData.lon = user.location[1];
                postData.rangeInMiles = user.range || null;
            }
            loggedIn = true;
        }
    } else {
        userId = null;
        loggedIn = false;
    }
    let posts;

    // First we handle the basic search function that is found in the header.
    // So we get the searchTerm if its available and set it toLowerCase();
    const searchTerm = req.query.term?.toLowerCase() ?? null;
    const searchType = req.query.search_type;
    // Then if there is a searchType we know we are doing a basic search.
    if (searchType) {
        posts = await handleBasicSearch(postData, searchType, searchTerm);
    } else {    // Otherwise we are doing a advanced search.
        let q = req.query;
        // Use the username in the query to get the UserId for ease in getting their posts.
        let users = await getUsers(null, q.username?.toLowerCase() ?? null);
        const userId = users[0]?.user.sub || null;
        postData = {
            userId: userId,
            instrument: q.instrument?.toLowerCase() ?? null,
            genre: q.genre?.toLowerCase() ?? null,
            skillLevel: q.skillLevel?.toLowerCase() ?? null,
            descriptor: q.descriptor?.toLowerCase() ?? null,
            rangeInMiles: q.range,
            start_date: q.start_date.value ? new Date(q.start_date.value).getTime() : null,
            end_date: q.end_date.value ? new Date(q.end_date.value).getTime() : null
        };
        posts = await getPosts(postData);
    }

    ({user, userId} = authenticateUser(req, user, userId));

    res.render('searchpage', {posts: posts, user: user, loggedIn: loggedIn});
});

async function handleBasicSearch(postData, searchType, searchTerm) {
    switch (searchType) {
        case 'instrument':
            postData.instrument = searchTerm
            break;
        case 'user':
            let users = await getUsers(null, searchTerm);
            let userId = null
            if (users[0]) {
                userId = users[0].user.sub;
            }
            postData.userId = userId;
            break;
        case 'genre':
            postData.genre = searchTerm
            break;
        case 'descriptor':
            postData.descriptor = searchTerm
            break;
        default:
            break;
    }
    posts = await getPosts(postData);
    return posts;
}

module.exports = router;
