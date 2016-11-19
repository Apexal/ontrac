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

router.post('/', (req, res, next) => {
    res.redirect('/');
});

router.get('/setup', (req, res, next) => {
    res.locals.pageTitle = 'Setup';

    req.db.School.find().then((schools) => { 
        res.locals.schools = schools;

        let statuses = [{
            description: 'Accept Terms of Service',
            completed: req.user.setupStatus.acceptedTOS
        },
        {
            description: 'Choose School',
            completed: req.user.setupStatus.choseSchool
        },
        {
            description: 'Fill Out Profile',
            completed: req.user.setupStatus.uploadedSchedule
        },
        {
            description: 'Upload Schedule',
            completed: req.user.setupStatus.uploadedSchedule
        }];

        res.locals.statuses = statuses;
        res.render('account/setup');
    });
});

router.post('/setup/:action', (req, res, next) => {
    const action = req.params.action;
    
    req.db.User.findById(req.user._id)
        .then((user) => {
            if (action == 'acceptTOS') {
                user.setupStatus.acceptedTOS = true;
            } else if (action == 'chooseSchool') {
                const schoolId = req.body['school-select'];
                if(schoolId) {
                    user.school = schoolId;
                    user.setupStatus.choseSchool = true;
                } else {
                    req.flash('error', 'There was an error.');
                }
            }

            user.save(() => {
                res.redirect('/account/setup');
            });
        });
});

module.exports = router;
