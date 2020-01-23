const express = require('express');
const router  = express.Router();

router.get('/redirect/sourceCode', (req, resp, next) => {
    resp.redirect('');
});

module.exports = router;