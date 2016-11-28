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
    //update info
    res.redirect('/');
});

router.post('/addcourse', (req, res) => {
    const newCourseName = req.body['course-name'];
    const newCourseShortName = (req.body['course-short-name'] ? req.body['course-short-name'] : newCourseName);
    if (!newCourseName) return next('Invalid form data!');
    
    req.db.User.findById(req.user._id).exec().then((user) => {
        user.courses.push({
            title: newCourseName.substring(0, 60),
            shortTitle: newCourseShortName.substring(0, 60)
        });

        user.save(() => {
            req.flash('info', `Added course ${newCourseShortName} to list.`)
            res.redirect('/account');
        });
    });
});

router.post('/removecourse', (req, res) => {
    const courseName = req.body['course-name'];
    if (!courseName) { res.json({ err: 'Invalid data passed. Missing course-name' }); return; }

    req.db.User.findById(req.user._id).exec().then((user) => {
        user.courses = user.courses.filter((c) => { return c.title != courseName });

        user.save(() => {
            req.flash('info', `Removed course ${courseName} from list.`)
            res.json({ success: true });
        });
    });
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

/* Sets the user's status on the Terms of Service as accepted. */
router.post('/setup/acceptTOS', (req, res, next) => {
    req.newUser.setupStatus.acceptedTOS = true;
    req.flash('info', 'Accepted Terms of Service.');
    next();
});

/* Sets the user's school. */
router.post('/setup/chooseSchool', (req, res, next) => {
    const schoolId = req.body['school-select'];
    if(schoolId) {
        req.newUser.school = schoolId;
        req.newUser.setupStatus.choseSchool = true;
        req.flash('error', 'Set your school.');
    } else {
        req.flash('error', 'There was an error.');
    }
    next();
});

/* Accepts the uploaded schedule file and tries to parse it by school */
router.post('/setup/uploadSchedule', upload.single('schedule-file'), (req, res, next) => {
    const content = req.file.buffer.toString();
    
    // Try to load the school-specific schedule parser
    if (!req.user.school) {
        return next('You have not choosen a school yet!');
    } else if (!req.user.school.scheduleAvailable) {
        return next('Schedule uploading is not yet available for ' + req.user.school.name);
    }

    const parser = require(`../modules/schools/${req.user.school.name.toLowerCase()}.js`);

    req.newUser.schedule = parser.parseSchedule(content);
    req.flash('info', 'Uploaded schedule!');

    if (req.newUser.courses.length == 0) {
        req.newUser.courses = parser.getCoursesFromSchedule(req.newUser.schedule);
        req.flash('info', 'Successfully got courses from schedule!');
    }

    next();
});

router.post('/setup/:action', (req, res, next) => {
    req.newUser.save(() => {
        res.redirect('/account/setup');
    });
});

module.exports = router;
