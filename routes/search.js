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
    if (req.oidc.isAuthenticated()) {
        userId = req.oidc.user.sub;
        const users = await getUsers(null, null, userId)
        if (users.length>0) {
            userObject=users[0];
            if (userObject.user.location) {
                lat = userObject.user.location[0];
                lon = userObject.user.location[1];
                if (userObject.range) {
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
    const searchTerm = req.query.term;
    const searchType = req.query.search_type;
    if (searchType != null) {
        posts = await handleBasicSearch(searchType, posts, searchTerm, lat, lon, range);
    }
    else {
        let q = req.query;
        let users = await getUsers(null, q.username);
        let userId = null
        if (users[0]) {
            userId = users[0].userId;
        }
        posts = await getPosts(userId, null,
            q.instrument, q.genre, q.descriptor, lat, lon, q.range,
            q.start_date, q.end_date);
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
