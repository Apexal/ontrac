var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer(); // Files are kept in memory

/* This entire route can only be used by logged in users. */
router.use(requireLogin);

router.get('/',(req, res, next) => {
    res.locals.pageTitle = 'Your Account';
    res.render('account/index');
});

router.post('/', (req, res, next) => {
    res.redirect('/');
});

router.get('/setup',(req, res, next) => {
    res.locals.pageTitle = 'Setup';

    req.db.School.find().exec().then((schools) => { 
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

/* All setup actions will pass through here before going on to their specific routes for each action */
router.post('/setup/:action', (req, res, next) => {
    req.db.User.findById(req.user._id)
        .exec()
        .then((user) => {
            console.log('1');
            /*if (action == 'acceptTOS') {
                
            } else if (action == 'chooseSchool') {
                const schoolId = req.body['school-select'];
                if(schoolId) {
                    user.school = schoolId;
                    user.setupStatus.choseSchool = true;
                } else {
                    req.flash('error', 'There was an error.');
                }
            } else if (action == 'uploadSchedule') {
                if (req.files) {
                    console.log(req.files['schedule-file']);
                    console.log(new TextDecoder('utf-8').decode(req.files['schedule-file'].data));
                }
            }
            */
            req.newUser = user;
            next();
        });
});

/* Set's the user's status on the Terms of Service as accepted */
router.post('/setup/acceptTOS', (req, res, next) => {
    req.newUser.setupStatus.acceptedTOS = true;
    next();
});

/* Accepts the uploaded schedule file and tries to parse it by school */
router.post('/setup/uploadSchedule', upload.single('schedule-file'), (req, res, next) => {
    console.log(req.file);
    const content = req.file.buffer.toString();
    // Try to load the school-specific schedule parser
    console.log(`Using parser for ${req.user.school.name}`);
    const parser = require(`../modules/schools/${req.user.school.name}.js`);

    req.newUser.schedule = parser(content);

    next();
});

router.post('/setup/:action', (req, res, next) => {
    console.log('3');
    req.newUser.save(() => {
        res.redirect('/account/setup');
    });
});

module.exports = router;
