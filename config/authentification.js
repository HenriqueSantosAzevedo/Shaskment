module.exports = {
    isLogedin: function () {
        return (req, res, next) => {
            if (req.isAuthenticated()) return next();
            res.redirect('/signin');
        }
    }
}