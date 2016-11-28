var express = require('express');
var router = express.Router();

/* GET home page. */
router.get(['/', '/home'], (req, res, next) => {

  if (req.isAuthenticated())
    res.render('index/index');
  else
    res.render('index/homepage');
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
    
    res.redirect('/auth/google');
});

router.get('/test/:id', (req, res, next) => {
  console.log("1");
  next();
});

router.get('/test/2', (req, res, next) => {
  console.log("2");
  next();
});

router.get('/test/:id', (req, res, next) => {
  console.log("3");
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('info', 'Successful logout.');
  res.redirect('/');
});

module.exports = router;
