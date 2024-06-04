var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
/* GET page. */
router.get('/', function (req, res, next) {
    console.log("changepassword.js: GET");
    res.render('changepassword', {});
});

/* POST page. */
router.post('/', function (req, res, next) {

    console.log("changepassword.js: POST");

    // Get values from POST from the client
    const username = req.session.username;
    const hash = req.body.hash;
    const salt = req.body.salt;
    console.log("changepassword.js: username: " + username + " salt: " + salt + " hash: " + hash);
    let sql = "CALL change_password(?, ?, ?);";
    dbCon.query(sql, [username, hash, salt], function (err, rows) {
        if (err) {
            throw err;
        }

        //show notification
        //wait 2 seconds
        //go back to home

        res.redirect('/home');
    });

});

module.exports = router;