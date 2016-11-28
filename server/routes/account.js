var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer(); // Files are kept in memory

const ideal = {
    acceptedTOS: true,
    choseSchool: true,
    uploadedSchedule: true,
    fillOutProfile: true,
    addedCourses: true
};

/* This entire route can only be used by logged in users. */
router.use(requireLogin);

router.get('/',(req, res, next) => {
    res.locals.pageTitle = 'Your Account';
    res.render('account/index');
});

/* Updates the user's profile info. */
router.post('/', (req, res, next) => {
    req.db.User.findById(req.user._id).exec().then((user) => {

        // Check what new data was sent and fall back on existing data
        const firstName = (req.body['first-name'] ? req.body['first-name'].substring(0, 20) : user.name.first);
        const lastName = (req.body['last-name'] ? req.body['last-name'].substring(0, 30) : user.name.last);
        const nickname = (req.body['nickname'] ? req.body['nickname'].substring(0, 30) : user.name.nickname);
        const bio = (req.body['bio'] ? req.body['bio'].substring(0, 120) : user.bio);

        user.name.first = firstName;
        user.name.last = lastName;
        user.name.nickname = nickname;
        user.bio = bio;

        user.setupStatus.fillOutProfile = true;

        if (user.accountStatus == 0) {
            if (JSON.stringify(user.setupStatus) == JSON.stringify(ideal)) {
                user.accountStatus = 1;
                req.flash('success', 'You have finished account setup! You can now access all OnTrac features.');    
            }
        }

        user.save(() => {
            req.flash('info', 'Updated profile.')
            res.redirect('/account');
        });
    });
});

/* Adds a course with a long and short name to the list. */
router.post('/addcourse', (req, res) => {
    const newCourseName = req.body['course-name'];
    const newCourseShortName = (req.body['course-short-name'] ? req.body['course-short-name'] : newCourseName);
    if (!newCourseName) return next('Invalid form data!');
    
    req.db.User.findById(req.user._id).exec().then((user) => {
        // Limits size of course names to around 60 chars
        user.setupStatus.addedCourses = true;
        user.courses.push({
            title: newCourseName.substring(0, 60),
            shortTitle: newCourseShortName.substring(0, 60)
        });

        if (user.accountStatus == 0) {
            if (JSON.stringify(user.setupStatus) == JSON.stringify(ideal)) {
                user.accountStatus = 1;
                req.flash('success', 'You have finished account setup! You can now access all OnTrac features.');    
            }
        }

        user.save(() => {
            req.flash('info', `Added course ${newCourseShortName.substring(0, 60)} to list.`)
            res.redirect('/account');
        });
    });
});

/* Removes a course from the list. JSON */
router.post('/removecourse', (req, res) => {
    const courseName = req.body['course-name'];
    if (!courseName) { res.json({ err: 'Invalid data passed. Missing course-name' }); return; }

    req.db.User.findById(req.user._id).exec().then((user) => {
        user.courses = user.courses.filter((c) => { return c.title != courseName });
        user.setupStatus.addedCourses = true;

        if (user.accountStatus == 0) {
            if (JSON.stringify(user.setupStatus) == JSON.stringify(ideal)) {
                user.accountStatus = 1;
                req.flash('success', 'You have finished account setup! You can now access all OnTrac features.');    
            }
        }

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
            completed: req.user.setupStatus.fillOutProfile
        },
        {
            description: 'Upload Schedule',
            completed: req.user.setupStatus.uploadedSchedule
        },
        {
            description: 'Add Courses',
            completed: req.user.setupStatus.addedCourses
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
        req.newUser.setupStatus.addedCourses = true;
        req.flash('info', 'Successfully added courses from schedule!');
    }

    req.newUser.setupStatus.uploadedSchedule = true;
    
    next();
});

router.post('/setup/:action', (req, res, next) => {
    if (req.newUser.accountStatus == 0) {
        if (JSON.stringify(req.newUser.setupStatus) == JSON.stringify(ideal)) {
            req.newUser.accountStatus = 1;
            req.flash('success', 'You have finished account setup! You can now access all OnTrac features.');    
        }
    }

    req.newUser.save(() => {
        res.redirect('/account/setup');
    });
});

module.exports = router;
