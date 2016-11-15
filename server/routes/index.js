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

router.get('/login', (req, res) => {
    res.locals.pageTitle = 'Login';

    res.render('login');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('info', 'Successful logout.')
  res.redirect('/');
});

module.exports = router;
