var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/about', (req, res, next) => {
  res.locals.pageTitle = 'About';
  res.render('about');
});

module.exports = router;
