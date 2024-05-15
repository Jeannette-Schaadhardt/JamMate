const express = require('express');
const router = express.Router();
const { getPosts } = require('../model/mPost.js');
const { getUsers } = require('../model/mUser.js');


router.get('/', async(req, res) => {
    let userId = null;
    let loggedIn = false;
    let userObject;
    let lat = null;
    let lon = null;
    let range = null;
    // We want to use our user's location to perform the range calculations.
    if (req.oidc.isAuthenticated()) {
        userId = req.oidc.user.sub;
        const users = await getUsers(null, null, userId)
        if (users.length>0) {
            userObject=users[0];
            if (userObject.user.location) {
                lat = userObject.user.location[0];
                lon = userObject.user.location[1];
                if (userObject.user.range) {
                    range = userObject.user.range;
                }
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
    if (searchType != null) {
        posts = await handleBasicSearch(searchType, posts, searchTerm, lat, lon, range);
    } else {    // Otherwise we are doing a advanced search.
        let q = req.query;
        let userId = null;
        // Use the username in the query to get the UserId for ease in getting their posts.
        let users = await getUsers(null, q.username?.toLowerCase() ?? null);
        if (users[0]) userId = users[0].user.sub;
        // Convert date string to TimeStamp
        const startDateTimeStamp = q.start_date.value ? new Date(q.start_date.value).getTime() : null;
        const endDateTimeStamp = q.end_date.value ? new Date(q.end_date.value).getTime() : null;
        // Set all of the fields .toLowerCase() to avoid issues with case sensitivity.
        posts = await getPosts(
            userId,
            null,
            // Perform qualified lowerCase() operations on the strings.
            q.instrument?.toLowerCase() ?? null,
            q.genre?.toLowerCase() ?? null,
            q.skillLevel?.toLowerCase() ?? null,
            q.descriptor?.toLowerCase() ?? null,
            lat, lon, q.range,
            startDateTimeStamp,
            endDateTimeStamp);
    }
    res.render('searchpage', {posts: posts, user: userObject, loggedIn: loggedIn});
});

module.exports = router;

async function handleBasicSearch(searchType, posts, searchTerm, lat, lon, range) {
    switch (searchType) {
        case 'instrument':
            posts = await getPosts(null, null,
                searchTerm, null, null, lat, lon, range);
            break;
        case 'user':
            let users = await getUsers(null, searchTerm);
            let userId = null
            if (users[0]) {
                userId = users[0].user.sub;
            }
            posts = await getPosts(userId, null,
                null, null, null, lat, lon, range);
            break;
        case 'genre':
            posts = await getPosts(null, null,
                null, searchTerm, null, lat, lon, range);
            break;
        case 'descriptor':
            posts = await getPosts(null, null,
                null, null, searchTerm, lat, lon, range);
            break;
        default:
            posts = await getPosts(null, null,
                null, null, null, lat, lon, range);
            break;
    }
    return posts;
}
