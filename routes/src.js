const express = require('express');
const router  = express.Router();

router.get('/redirect/sourceCode', (req, resp, next) => {
    resp.redirect('https://github.com/HenriqueSantosAzevedo/Shaskment');
});

module.exports = router;
