# JamMate

JamMate is a 2024 Senior Capstone Project created by: <br>
Brandon Koehler <br>
Jeannette Schaadhardt <br>
Kevin Johnson

## The Goal:

Develop a web app called JamMate for finding musicians and artists via social media-like functionality using JS / HTML / CSS, hosted on Google Cloud Platform.

## Requirements:

Create a profile with various items like your instrument, experience level, preferred genre/styles, etc.
Create posts detailing what you are looking for and allow users to post their own personal ads
Enable users to upload audio and/or video samples of their music
Create a review system allowing other users to drop comments Allow search functionality so users can filter by an acceptable radius, instrument, skill level, etc.

## Development:

Developing Locally (for us. this might get complicated the more dependencies we include, so we will expand more for our sake.) <br>

1. npm install
2. npm i nodemon express ejs express-session
   # nodemon - for auto server restart after a change is detected
3. npm install express express-openid-connect --save
   # for auth0 compliance
4. gcloud init
5. npm i @google-cloud/datastore
6. gcloud config set project jammate-cs467
   # Configure gcloud for your project
7. either<br>(command line) nodemon server.js <br> (visual studio code) start debugger.
8. In browser go to localhost:9001

A sample work flow is to use Visual Studio Code, fetch the repository from Github, run the above commands, then with context on the server.js go to **Run -> Start Debugging**. This will recognize this as a nodejs application and run it accordingly.

## [Auth0](https://auth0.com/docs/quickstart/webapp/express/interactive)

1. To simulate the login, got to locahost:9001/login
2. To simulate a logout, go to localhost:9001/logout
   should redirect to home page bug signed out

You can create a fake account (helpful to save info for repeated tests!) <br>
eg.
betty@bop.com - email address <br>
Betty1234! - password <br>
should redirect to home page but signed in

[auth0 docs](https://auth0.com/docs/quickstart/webapp/express/interactive) <br>
So basically this 3rd party site lets a developer use their application
to authenticate users. I signed up with my OSU email, and created an app that
handles all this routing that integrates with JamMate. When a user is
authenticated, our running server sends the logged in home page, else it sends
the home page prompting you to login.

## [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/)

Bootstrap can be utilized by going to the [Bootstrap Docs](https://getbootstrap.com/docs/5.3/getting-started/introduction/) and copying in the templates desired into the html.

For online development you do not need to do any npm installs or change the .js file.<br>
Instead just have the CDM style sheet link and the CDM javascript link placed in the html file as shown [here](https://getbootstrap.com/docs/5.3/getting-started/introduction/).
