var express = require('express');
var router = express.Router();
var moment = require('moment');
var xmlbuilder = require('xmlbuilder');

/* This entire route can only be used by logged in users. */
router.use(requireLogin); // TODO: or api key

/* This decides whether to return XML or JSON depending on the request */
router.use(function(req, res, next) {
    res.sendData = function(obj) {
        if (req.accepts('json') || req.accepts('text/html')) {
            res.header('Content-Type', 'application/json');
            res.send(obj);
        } else if (req.accepts('application/xml')) {
            res.header('Content-Type', 'text/xml');
            var xml = xmlbuilder.create(obj);
            res.send(xml);
        } else {
            res.send(406); // 406 Not Acceptable
        }
    };

    next(); // When ready I should use res.status(200).sendData(obj);
});

router.get('/:date', (req, res, next) => {
    var dateString = res.locals.dateString = req.params.date;

    if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
        res.status(500).sendData({ err: 'Invalid date!' });
        return;
    }

    var date = moment(dateString, 'YYYY-MM-DD', true).toDate();
    req.db.Assignment.find({ userEmail: req.user.email, dueDate: date })
        .exec()
        .then((assignments) => {
            res.status(200).sendData(assignments);
        });    
});

module.exports = router;
