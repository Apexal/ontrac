var express = require('express');
var router = express.Router();
var models = require('../../models');

/* GET home page. */
router.get(['/', '/home'], (req, res, next) => {
  res.render('index/index');
});

router.get('/about', (req, res, next) => {
  res.locals.pageTitle = 'About';

  res.render('index/about');
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
      req.flash('warning', 'You are already logged in!')
      res.redirect('/');
      return;
    }
    
    res.locals.pageTitle = 'Login';
    res.render('index/login');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('info', 'Successful logout.');
  res.redirect('/');
});

module.exports = router;
