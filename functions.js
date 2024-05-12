const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require('jwks-rsa');
const { postUser } = require('./model/mUser');
const { getPosts } = require('./model/mPost.js');
const { getAds } = require('./model/mAd.js');

const DOMAIN = 'dev-gblxtkrkmbzldfsv.us.auth0.com';

// From Stack Overflow:
//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function getSecret(len) {
    let res = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let count = 0;
    while (count < len) {
        res += characters.charAt(Math.floor(Math.random() * charactersLength));
        count += 1;
    }
    return res;
}
// --------- auth0 authentication --------- //
function getConfig(secret) {
    const config = {
        authRequired: false,
        auth0Logout: true,
        secret: secret,
        baseURL: 'http://localhost:9001',
        clientID: 'm8ieh2LZtQAtr5AcFevaw99k6tZ3KqCw',
        issuerBaseURL: 'https://dev-gblxtkrkmbzldfsv.us.auth0.com'
      };
    return config;
}
function testJWT() {
// Citation
// https://snyk.io/advisor/npm-package/jwks-rsa/functions/jwks-rsa.expressJwtSecret
const testJWT = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${DOMAIN}/.well-known/jwks.json`
    }),
    issuer: `https://${DOMAIN}/`,
    algorithms: ['RS256']
});
    return testJWT;
}

/**
 * Handles authentication when trying to access webpages
 *
 * @param {*} req - holds user object and id
 * @param {*} res
 * @param {*} destination - Where we want to send user upon authentication.
 */
async function handleAuthenticationFlow(req, res, destination) {
    // Determine if user is logged in
    let user;
    let posts;
    let ads;
    let userID;
    if (req.oidc.isAuthenticated()) {
        user = { "user": req.oidc.user, "jwt": req.oidc.idToken, "loggedIn": true };
        userID = req.oidc.user.sub;
    } else {
        user = { "user": req.oidc.user, "jwt": req.oidc.idToken,  "loggedIn": false };
    }

    // Gather the posts for the appropriate page.
    if (destination === "profilepage" && user.loggedIn === true) {
        // Fetch only user's posts for the profile page
        posts = await getPosts(userID);
    } else if (destination === "postpage") {        // Fetch the individual post
        posts = await getPost();
    } else {
        posts = await getPosts();                   // Fetch all posts for other pages like the homepage
    }

    ads = await getAds();
    console.log("Number of current ads = ", ads.length);
    let randomAdIndex = Math.floor(Math.random() * ads.length);
    console.log(ads);
    // Render the destination page and be logged in.
    if (user.loggedIn === true) {
        ads = ads[randomAdIndex];
        postUser(user)
        .then(result => {
            res.render(destination, { ads: ads, posts: posts, user: result, loggedIn: true });
        });
    } else {     // User is not logged in so redirect home with undefined data and false login status
    if (destination === "profilepage") {
        res.render('homepage', { ads: ads, posts: posts, user: user, loggedIn: false});
    } else {
        res.render(destination, { ads: ads, posts: posts, user: user, loggedIn: false });
    }
}};

async function submitPost() {
    var formData = new FormData(document.getElementById('postForm'));
    $.ajax({
      url: '/create-post',
      type: 'POST',
      data: formData,
      success: function(data) {
        var newPost = '<div class="post" id="post-' + data.id + '">' +
                      '<p>User: <%= user.nickname %>, Content: "' + data.content + '", Posted at (' + new Date(data.timestamp).toLocaleString() + ')</p>' +
                      '<button onclick="deletePost(\'' + data.id + '\')">Delete Post</button>' +
                      '</div>';
        $('#posts').prepend(newPost);
        document.getElementById('postForm').reset(); // Reset the form
        document.getElementById('postCreationForm').style.display='none'; // Hide the form again
      },
      cache: false,
      contentType: false,
      processData: false,
      error: function(xhr, status, error) {
        alert("Error: " + xhr.responseText);
      }
    });
    return false;  // Prevent traditional form submission
  }

  async function submitAd() {
    var formData = new FormData(document.getElementById('adForm'));
    $.ajax({
      url: '/create-ad',
      type: 'POST',
      data: formData,
      success: function(data) {
        var newAd = '<div class="ad" id="ad-' + data.id + '">' +
                      '<p>User: <%= user.nickname %>, Content: "' + data.content + '", Posted at (' + new Date(data.timestamp).toLocaleString() + ')</p>' +
                      '<button onclick="deleteAd(\'' + data.id + '\')">Delete Ad</button>' +
                      '</div>';
        $('#ads').prepend(newAd);
        document.getElementById('adForm').reset(); // Reset the form
        document.getElementById('adCreationForm').style.display='none'; // Hide the form again
      },
      cache: false,
      contentType: false,
      processData: false,
      error: function(xhr, status, error) {
        alert("Error: " + xhr.responseText);
      }
    });
    return false;  // Prevent traditional form submission
  }

  module.exports = {
    getSecret, getConfig, testJWT, handleAuthenticationFlow, submitPost, submitAd
  }
