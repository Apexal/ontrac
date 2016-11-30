var express = require('express');
var router = express.Router();
var moment = require('moment');

/* This entire route can only be used by logged in users. */
router.use(requireLogin);

router.get('/', (req, res, next) => {
    res.locals.pageTitle = 'Assignments';
    res.render('assignments/index');
});

router.get('/today', (req, res, next) => {
    res.redirect(`/assignments/${moment().format('YYYY-MM-DD')}`);
});

router.get('/closest', (req, res) => {

});

router.get('/:date', (req, res, next) => {
    var dateString = res.locals.dateString = req.params.date;
    res.locals.date = false;
    res.locals.isToday = (dateString == moment().format("YYYY-MM-DD"));

    if(moment(dateString, 'YYYY-MM-DD', true).isValid() == false){
        return next('Invalid date!');
    }

    var date = res.locals.date = moment(dateString, 'YYYY-MM-DD', true);
    res.locals.pageTitle = date.format('dddd, MMM Do YY');
    res.locals.items = false;

    // Get prev/next daysa
    res.locals.previousDay = moment(date).subtract(1, 'days');
    res.locals.nextDay = moment(date).add(1, 'days');
    
    res.render('assignments/date');
});

module.exports = router;
