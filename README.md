JamMate is a Senior Portfolio Project from 2024 that was created by:
Brandon Koehler
Jeannette Schaadhardt
Kevin Johnson

The Goal:
Develop a web app called JamMate for finding musicians and artists via social media-like functionality using JS / HTML / CSS, hosted on Google Cloud Platform.

Requirements:
Create a profile with various items like your instrument, experience level, preferred genre/styles, etc.
Create posts detailing what you are looking for and allow users to post their own personal ads
Enable users to upload audio and/or video samples of their music
Create a review system allowing other users to drop comments Allow search functionality so users can filter by an acceptable radius, instrument, skill level, etc.

Developing Locally (for us. this might get complicated the more dependencies we include, so we will expand more for our sake):

1. npm install
2. npm i nodemon express
   nodemon - for auto server restart after a change is detected
3. npm install express express-openid-connect --save
   for auth0 compliance
4. nodemon server.js
5. go to browser and go to localhost:9001
   buttons don't do anything yet
6. to simulate the login, got to locahost:9001/login
   can create a fake account (helpful to save info for repeated tests!)
   eg., one of mine is
   betty@bop.com - email address
   Betty1234! - password
   should redirect to home page bug signed in
7. to simulate a logout, go to localhost:9001/logout
   should redirect to home page bug signed out

// ------------- extra notes ------------------ //
auth0 docs: https://auth0.com/docs/quickstart/webapp/express/interactive
So basically this 3rd party site lets a developer use their application
to authenticate users. I signed up with my OSU email, and created an app that
handles all this routing that integrates with JamMate. When a user is
authenticated, our running server sends the logged in home page, else it sends
the home page prompting you to login.
