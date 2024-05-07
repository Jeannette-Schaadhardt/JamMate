const express = require('express');
const bodyParser = require('body-parser');
const usersModelFunctions = require('../model/mUser.js');
const router = express.Router();
const { postUser } = require('../model/mUser.js');
const axios = require('axios');
const CLIENT_ID = 'm8ieh2LZtQAtr5AcFevaw99k6tZ3KqCw';
const CLIENT_SECRET = 'PCA5U4vXyBmIBiquMyLaKM5p18acrIcMBtke1fbeMLwhH1XFAd6m6iIz_PevGdrK-hV4uanysS4PZdcE9tnMSOBjrqSLP6GuoWD';
const DOMAIN = 'dev-gblxtkrkmbzldfsv.us.auth0.com';
router.use(bodyParser.json());
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post('/', (req, res) => {
    const options = {
        method: 'POST',
        url: `https://${DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/json' },
        data: {
          grant_type: 'password',
          username: req.body.username,
          password: req.body.password,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        },
        json: true
      };

      axios.post(options.url, { "username": req.body.username, "password": req.body.password }, options)
        .then((response) => {
          console.log("==============================");
          console.log(response.data);
          console.log("==============================");
          res.send(response.data);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send(error);
        });
});

router.get('/', (req, res) => {
    res.send('youre in /login');
});

router.use('/login', router);

module.exports = router;
