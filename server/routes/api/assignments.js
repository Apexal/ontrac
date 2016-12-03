var express = require('express');
var router = express.Router();
var moment = require('moment');
var xmlbuilder = require('xmlbuilder');

function assignmentsToXML(assignments) {
    let data = xmlbuilder.create('assignments');
    assignments.forEach((a) => {
        const assignment = data.ele('assignment', {
            id: a._id,
            userEmail: a.userEmail,
            priority: a.priority,
            dueDate: a.dueDate,
            courseName: a.courseName,
            link: (a.link ? a.link: ''),
            completed: a.completed
        }, a.description);
    });
    data = data.end({pretty: true});
    return data;
}

function assignmentToXML(a) {
    return xmlbuilder.create({
        assignment: {
            '@id': a._id,
            '@dueDate': a.dueDate,
            '@userEmail': a.userEmail,
            '@priority': a.priority,
            '@courseName': a.courseName,
            '@link': (a.link ? a.link: ''),
            '@completed': a.completed,
            '#text': a.description,
        }
    }).end({pretty: true});
}

/* This entire route can only be used by logged in users. */
router.use(requireLogin); // TODO: or api key

/* This decides whether to return XML or JSON depending on the request */
router.use(function(req, res, next) {
    res.format = 'json';
    if (req.accepts('json') || req.accepts('text/html')) {
        res.header('Content-Type', 'application/json');
    } else if (req.accepts('application/xml')) {
        res.header('Content-Type', 'text/xml');
        res.format = 'xml';
    } else {
        return res.send(406); // 406 Not Acceptable
    }

    next();
});

/* Returns JSON array of objects for FullCalendar */
router.get('/events', (req, res) => {
    const startDateString = req.query.start;
    const endDateString = req.query.end;
    if(!startDateString || !endDateString || !moment(startDateString, 'YYYY-MM-DD', true).isValid() || !moment(endDateString, 'YYYY-MM-DD', true).isValid())
        return res.json({ err: 'Invalid start date or end date.' });

    const start = moment(startDateString, 'YYYY-MM-DD', true);
    const end = moment(endDateString, 'YYYY-MM-DD', true);
    req.db.Assignment.find({ userEmail: req.user.email, dueDate: { '$gte': start.toDate(), '$lt': end.toDate() } })
        .lean()
        .exec()
        .then((items) => {
            let events = [];
            let days = {};

            items.forEach((i) => {
                if(!days[i.dueDate]) days[i.dueDate] = [];
                days[i.dueDate].push(i);    
            });

            for(let date in days) {
                const dayItems = days[date];
                const total = dayItems.length;
                let doneCount = 0;

                dayItems.forEach((i) => { if (i.completed) doneCount++; }); // Get # of completed assignments
                const percentDone = Math.round((doneCount / total) * 100);

                let color = 'green';
                if (percentDone < 66) color = 'blue'; if (percentDone < 33) color = 'red';

                events.push({
                    title: `<b class='assignment-calendar-event'>${total} assignments ${percentDone !== 100 ? `<span class='right'>${percentDone}% done</span>` : ''}</b>`,
                    start: moment(date).format('YYYY-MM-DD'),
                    color: color,
                    url: `/work/${moment(date).format('YYYY-MM-DD')}`
                });
            }

            res.json(events);
        })
        .catch((err) => {
            return res.json({ err: err });
        });
});

router.get('/one/:id', (req, res) => {
    const assignmentId = req.params.id;
    req.db.Assignment.findOne({ userEmail: req.user.email, _id: assignmentId })
        .exec()
        .then((assignment) => {
            if (!assignment) throw 'No assignment found!';

            res.status(200);
            if (res.format == 'json') 
                res.json(assignment);
            else
                res.send(assignmentToXML(assignment));
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.send({ err: err });
        });
});

/* Updates an assignment's completion status */
router.post('/one/:id', (req, res) => {
    const assignmentId = req.params.id;
    const newCompleted = req.body.completed;

    if (newCompleted == undefined) {
        res.status(500);
        res.send({ err: 'Incomplete data!' });
        return;
    }

    req.db.Assignment.findOne({ userEmail: req.user.email, _id: assignmentId })
        .exec()
        .then((assignment) => {
            if (!assignment) throw 'No assignment found!';

            res.status(200);

            assignment.completed = newCompleted;

            assignment.save((err) => {
                if (err) throw err;

                if (res.format == 'json') 
                    res.json(assignment);
                else
                    res.send(assignmentToXML(assignment));
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.send({ err: err });
        });
});

router.delete('/one/:id', (req, res) => {
    const assignmentId = req.params.id;

    req.db.Assignment.find({ userEmail: req.user.email, _id: assignmentId }).remove()
        .exec()
        .then((assignment) => {
            if (!assignment) {
                throw 'No assignment found!';
            }
            res.status(200);

            if (res.format == 'json') 
                res.json(assignment);
            else
                res.send(assignmentToXML(assignment));
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.send({ err: err });
        });
});

router.get('/:date', (req, res, next) => {
    var dateString = res.locals.dateString = req.params.date;

    if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
        res.status(500).send({ err: 'Invalid date!' });
        return;
    }

    var date = moment(dateString, 'YYYY-MM-DD', true).toDate();
    req.db.Assignment.find({ userEmail: req.user.email, dueDate: date })
        .exec()
        .then((assignments) => {
            res.status(200);
            
            if (res.format == 'json') 
                res.json(assignments);
            else
                res.send(assignmentsToXML(assignments));
        });    
});

/* Adds assignment to a date. */
router.put('/:date', (req, res, next) => {
    const userEmail = req.user.email;
    const date = req.params.date;

    const priority = 1;
    if (req.body.priority && req.body.priority >= 0 && req.body.priority <= 3) 
        priority = req.body.priority;
    const dueDate = moment(date, 'YYYY-MM-DD', true);
    const courseName = (req.body.courseName ? req.body.courseName.substring(0, 60) : 'Other');
    const description = req.body.description;
    const link = (req.body.link ? req.body.link.substring(0, 200) : undefined);
    const completed = false;

    if(!description)
        return res.send({ err: 'Invalid data!' });

    const newAssignment = new req.db.Assignment({
        userEmail: userEmail,
        priority: priority,
        dueDate: dueDate,
        courseName: courseName.substring(0, 60),
        description: description.substring(0, 120),
        link: link,
        completed: completed
    });

    newAssignment.save((err) => {
        if (err) return res.send({ err: err.message });
        res.status(200);
        
        if (res.format == 'json') 
            res.json(newAssignment);
        else
            res.send(assignmentToXML(newAssignment));
    });
});

module.exports = router;
