// User.js
var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});
mongoose.model('User', UserSchema);
module.exports = mongoose.model('User');

// CREATES A NEW USER
router.post('/', function (req, res) {
    User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        },
        function (err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});
// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req, res) {
    User.find({}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});

module.exports = router;