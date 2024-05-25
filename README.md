# JamMate

JamMate is a 2024 Senior Capstone Project created by: <br>
Brandon Koehler <br>
Jeannette Schaadhardt <br>
Kevin Johnson

## The Goal:

Develop a web app called JamMate for finding musicians and artists via social media-like functionality using JS / HTML / CSS, hosted on Google Cloud Platform.

## Requirements:

Create a profile with various items like your instrument, experience level, preferred genre/styles, etc. <br>
Create posts detailing what you are looking for and allow users to post their own personal ads. <br>
Enable users to upload audio and/or video samples of their music. <br>
Create a review system allowing other users to drop comments Allow search functionality so users can filter by an acceptable radius, instrument, skill level, etc.

## Development:
This flow was created with Visual Studio in mind.
1. Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install-sdk#installing_the_latest_version)
2. Install [NodeJS](https://nodejs.org/en) if not already installed and add to path
2. npm install (the following should get installed from the package.json)

   a. npm i nodemon express ejs express-session multer bootstrap-icons express-jwt jwks-rsa <br>
   b. npm i express express-openid-connect --save <br>
   c. npm i @google-cloud/firestore @google-cloud/storage
3. gcloud init

   a. Login with your account associated with gcloud <br>
   b. It automatically should let you select your project in the terminal but if not use: gcloud config set project jammate-cs467
4. gcloud auth application-default login
5. Launch server either with:<br>(command line) nodemon server.js <br> (visual studio code) Launch Program.
6. In browser go to localhost:9001

## [Auth0](https://auth0.com/docs/quickstart/webapp/express/interactive)
1. To simulate the login, got to locahost:9001/login
2. To simulate a logout, go to localhost:9001/logout

[auth0 docs](https://auth0.com/docs/quickstart/webapp/express/interactive) <br>
This 3rd party site lets a developer use their application
to authenticate users. I signed up with my OSU email, and created an app that
handles all this routing that integrates with JamMate. When a user is
authenticated, our running server sends the logged in home page, else it sends
the home page prompting you to login.

## [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/)

Bootstrap can be utilized by going to the [Bootstrap Docs](https://getbootstrap.com/docs/5.3/getting-started/introduction/) and copying in the templates desired into the html.

For online development you do not need to do any npm installs or change the .js file.<br>
Instead just have the CDM style sheet link and the CDM javascript link placed in the html file as shown [here](https://getbootstrap.com/docs/5.3/getting-started/introduction/).

## Misc_Files

cors-file.json - within the terminal of our project you can use this: <br>
"gcloud storage buckets update gs://jammate-cs467_cloudbuild --cors-file=./misc_files/cors-file.json"
<br> to update the Cross-Origin Source protocol for our GCS bucket.
