const express = require('express');
const router  = express.Router();

router.get('/friends', require('../../config/authentification').isLogedin(), (req, resp, next) => {
    resp.render('friends/main',
        {
            msgList: req.flash('messages')
        }
    )
});

module.exports = router;