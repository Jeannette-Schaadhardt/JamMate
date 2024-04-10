const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9001;

app.use(bodyParser.json());


app.get('/', (req, res) => {
        const filePath = path.resolve(__dirname, './view/index.html');
        res.sendFile(filePath);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});