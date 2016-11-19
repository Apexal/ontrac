var express = require('express');
var router = express.Router();

/*
    This entire route can only be used by logged in users
*/
router.use((req, res, next) => {
    if (req.app.locals.requireLogin(req, res)) return;
    next();
});

router.get('/', (req, res, next) => {
    res.locals.pageTitle = 'Your Account';
    res.render('account/index');
});

router.get('/setup', (req, res, next) => {
    res.locals.pageTitle = 'Setup';

    const s = req.db.School();
    s.name = 'School';
    s.save();

    req.db.School.find().then((schools) => { 
        res.locals.schools = schools;
        res.render('account/setup');
    });
});

module.exports = router;
