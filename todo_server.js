#!/usr/bin/env node --harmony
'use strict';
const
    express = require('express'),
    exphbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    session = require('express-session'),
    // RedisStore = require('connect-redis')(session),
    app = express();

var port = process.env.PORT || 8080;
app.use(morgan('dev'));

// REGISTER Handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// BEGIN AUTHENTICATION
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

app.use(session({
    secret: 'impossible to predict',
    // store: new RedisStore(),
    saveUninitialized: false,
    resave: false
}));
app.use(passport.initialize());
app.use(passport.session());

var User = function(username) {
    this.username = username;
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        if(username == "zhaw" && password == "secret") {
            var user = new User(username);
            console.log("authenticated");
            return done(null, user);
        }
        else {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
    })
);

// Custom middleware to authenticate custom routes
function authed(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(403, '/login.html');
    }
}

app.get('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login.html'
    })
);
// END AUTHENTICATION

app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/static_html'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

var todos = [];
var id = 0;

app.post('/todos', function (req, res) {
    id = id + 1;
    todos.push({ todos: req.body.todo, id: id });

    res.status(200).json({ 'todo': req.body.todo, 'id': id });
});

app.post('/todos/:id', function(req, res) {
    var deleteId = req.param("id");

    for(var i = 0; i < todos.length; i++){
        if(todos[i].id == deleteId){
            todos.splice(i, 1);
            break;
        }
    }

    res.status(200).json({ 'id': deleteId });
});

app.post('/logout', function(req, res) {
    req.session.destroy(function(){
        res.redirect('/');
    });
});

app.get('/todos', function (req, res) {
    res.status(200).json({ 'todos': todos });
});

app.get('/', authed, function(req, res) {
    res.render("home", { user: req.user });
});

app.listen(port, function () {
    console.log("ready captain.");
});
