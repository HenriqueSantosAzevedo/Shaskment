const express = require('express');
const router  = express.Router();

router.get('/friends/findnew', require('../../config/authentification').isLogedin(), (req, resp, next) => {

});

module.exports = router;