var express = require('express');
var router = express.Router();
var moment = require('moment');
var xmlbuilder = require('xmlbuilder');

function gradedItemsToXML(gradedItems) {
    let data = xmlbuilder.create('gradedItems');
    gradedItems.forEach((g) => {
        const gradedItem = data.ele('gradedItem', {
            // FILL IN
        }, g.description);
    });
    data = data.end({ pretty: true });
    return data;
}

function gradedItemToXML(g) {
    return xmlbuilder.create({
        gradedItem: {
            
        }
    }).end({ pretty: true });
}

/* Returns JSON array of objects for FullCalendar */
router.get('/events', (req, res) => {
    const startDateString = req.query.start;
    const endDateString = req.query.end;
    if(!startDateString || !endDateString || !moment(startDateString, 'YYYY-MM-DD', true).isValid() || !moment(endDateString, 'YYYY-MM-DD', true).isValid())
        return res.json({ err: 'Invalid start date or end date.' });

    const start = moment(startDateString, 'YYYY-MM-DD', true);
    const end = moment(endDateString, 'YYYY-MM-DD', true);
    req.db.GradedItem.find({ userEmail: req.user.email, dueDate: { '$gte': start.toDate(), '$lt': end.toDate() } })
        .lean()
        .exec()
        .then((items) => {
            let events = [];
           
            items.forEach((item) => {
                const date = item.dueDate;
                const title = `${item.title} ${item.type}`;
                events.push({
                    title: `<b class='graded-item-calendar-event'>${title}</b>`,
                    start: moment(date).format('YYYY-MM-DD'),
                    color: 'orange',
                    url: `/work/${moment(date).format('YYYY-MM-DD')}#gradedItems`
                });
            })
            res.json(events);
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            return res.json({ err: err });
        });
});

router.get('/one/:id', (req, res) => {
    const gradedItemId = req.params.id;
    req.db.GradedItem.findOne({ userEmail: req.user.email, _id: gradedItemId })
        .exec()
        .then((gradedItem) => {
            if (!gradedItem) throw 'No assignment found!';

            res.status(200);
            if (res.format == 'json') 
                res.json(gradedItem);
            else
                res.send(gradedItemToXML(gradedItem));
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
    req.db.GradedItem.find({ userEmail: req.user.email, dueDate: date })
        .exec()
        .then((gradedItems) => {
            res.status(200);
            
            if (res.format == 'json') 
                res.json(gradedItems);
            else
                res.send(gradedItemsToXML(gradedItems));
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.send({ err: err });
        });
});

/* Adds graded item to a date. */
router.put('/:date', (req, res, next) => {
    const date = req.params.date;

    const userEmail = req.user.email;
    const dueDate = moment(date, 'YYYY-MM-DD', true);
    const type = (req.body.type ? req.body.type : 'test').toLowerCase();
    const priority = 1;
    if (req.body.priority && req.body.priority >= 0 && req.body.priority <= 3) 
        priority = req.body.priority;
    const courseName = (req.body.courseName ? req.body.courseName.substring(0, 60) : 'Other');
    const title = req.body.title;
    const description = (req.body.description ? req.body.description.substring(0, 500) : 'No description given.');
    const links = (req.body.links ? req.body.links.split(';') : []);

    if(!title)
        return res.send({ err: 'Invalid data!' });

    const newGradedItem = new req.db.GradedItem({
        userEmail: userEmail,
        type: type,
        priority: priority,
        dueDate: dueDate,
        courseName: courseName,
        title: title,
        description: description,
        links: links
    });

    newGradedItem.save((err) => {
        if (err) return res.send({ err: err.message });
        res.status(200);
        
        if (res.format == 'json') 
            res.json(newGradedItem);
        else
            res.send(assignmentToXML(newGradedItem));
    });
});

module.exports = router;
