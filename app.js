const express = require('express');
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helpers = require('./server/modules/helpers.js');
const fs = require('fs');
const recursiveReadSync = require('recursive-readdir-sync');
const session = require('express-session');
const config = require('./config/config.json');
const models = require('./models');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

//const mongodb = require('./server/modules/mongodb.js');


passport.use(new GoogleStrategy({
        clientID: config.auth.google_client_id,
        clientSecret: config.auth.google_client_secret,
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, cb) {
        // Make sure Regis email
        if (!profile.emails[0].value.endsWith('@regis.org')) {
            return cb(null, false, { message: 'You must use a Regis Google account!' });
        }
        
        const username = profile.emails[0].value.replace('@regis.org', '');
        models.Student.findOne({
            where: { username: username }
        }).then((student) => {
            return cb(null, student);
        });
    }
));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  models.Student.findById(id).then((student) => {
     cb(null, student);     
  });
});

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.basedir = path.join(__dirname, 'views');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); TODO: add favicon
app.use(compression());
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 5 }
}));
app.use(require('flash')());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'client/public')));

// View helper methods
app.locals.helpers = {};
for (var h in helpers) {
    if (typeof(helpers[h]) === 'function') {
        app.locals.helpers[h] = helpers[h];
    }
}

// ALL REQUESTS PASS THROUGH HERE FIRST
app.locals.defaultTitle = 'OnTrac';
app.use((req, res, next) => {
    res.locals.pageTitle = app.locals.defaultTitle;
    res.locals.pagePath = req.path;
    res.locals.user = req.user;

    next();
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/drive.file', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
        // Successful authentication, redirect home.
        req.flash('info', 'Successful login.')
        res.redirect('/');
    });

// Dynamically load routes
const routePath = path.join(__dirname, 'server/routes') + '/';
const files = recursiveReadSync(routePath);
for (var index in files) {
    const path = files[index].replace(`${__dirname}/server/routes/`, '');

    var router = require(files[index]);
    var name = ( path == 'index.js' ? '' : path.replace('.js', '') );
    try {
        app.use('/' + name, router);
        console.log(`Using ${path} for '/${name}'.`);
    } catch(err) {
        console.log(`Failed to load route '/${name}': ${err}`);
    }
}

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
