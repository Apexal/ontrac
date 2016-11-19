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

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const mongodb = require('./server/modules/mongodb.js');

passport.use(new GoogleStrategy({
        clientID: config.auth.google_client_id,
        clientSecret: config.auth.google_client_secret,
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, cb) {
        const email = profile.emails[0].value;

        mongodb.User.findById(profile.id)
            .then((user) => {
                if (user) {
                    console.log('Found!');
                } else {
                    console.log('New user!');

                    const name = {
                        first: ( profile.name.givenName.trim().length > 0 ? profile.name.givenName : 'New' ),
                        last: ( profile.name.familyName.trim().length > 0 ? profile.name.familyName : 'Student' ),
                        nickname: ( profile.displayName.trim().length > 0 ? profile.displayName : 'New Student' )
                    }

                    user = new mongodb.User({
                        _id: profile.id,
                        email: email,
                        name: name
                    });

                    user.save();
                }

                cb(null, user);
        })
        .catch((error) => {
            console.log(error);
            cb(null, false, { message: 'There was an error logging you in, please try again later.' });
        });
    }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(user, cb) {
    cb(null, user);     
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
    
    if (req.user)
        res.locals.user = req.user;

    res.locals.loggedIn = req.isAuthenticated();
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
