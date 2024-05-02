import { expressjwt } from "express-jwt";
import ExpressJwtRequest from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { postUser } from './model/mUser.js';
import { getPosts } from './model/mPost.js'; // Assuming this is adjusted similarly

const DOMAIN = 'dev-gblxtkrkmbzldfsv.us.auth0.com';
// From Stack Overflow:
//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
export function getSecret(len) {
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
export function getConfig(secret) {
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
export function testJWT() {
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
 * Handles re-authentication when trying to access webpages
 *
 * @param {*} req - holds user object and id
 * @param {*} res
 * @param {*} destination - Where we want to send user upon authentication.
 */
export async function handleAuthenticationFlow(req, res, destination) {
    // User is logged in
    if (req.oidc.isAuthenticated()) {
        let user = { "user": req.oidc.user, "jwt": req.oidc.idToken,  "loggedIn": true };
        const posts = await getPosts();

        postUser(user)
        .then(result => {
            res.render(destination, { posts: posts, user: result, loggedIn: true });
        });
    }

    // User is not logged in so redirect home with undefined data and false log in status
    else {

        let data = { "user": req.oidc.user, "jwt": req.oidc.idToken,  "loggedIn": false };
        res.render('homeLoggedOut', data);
    }
}

export async function submitPost() {
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