var express = require("express");
var app = express();
var mongoose = require('mongoose');
var router = express.Router();
var path = __dirname + '/views/';
var session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


router.use(function (req, res, next) {
    console.log("/" + req.method);
    next();
});

router.get("/", function (req, res) {
    res.sendFile(path + "index.html");
});

router.get("/about", function (req, res) {
    res.sendFile(path + "about.html");
});

router.get("/contact", function (req, res) {
    res.sendFile(path + "contact.html");
});

router.get("/login", function (req, res) {
    res.sendFile(path + "login.html");
});

router.get('/user', function (req, res) {
    res.sendFile(path + "user.html");
});

router.get("/register", function (req, res) {
    res.sendFile(path + "register.html");
});

app.use(express.static('public'));

app.use("/", router);

app.use("*", function (req, res) {
    res.sendFile(path + "404.html");
});

app.listen(3000, function () {
    console.log("Live at Port 3000");
});