var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
/* GET page. */
router.get('/', function (req, res, next) {
    console.log("register.js: GET");
    res.render('register', { formData: {} });
});

/* POST page. */
router.post('/', function (req, res, next) {

    console.log("register.js: POST");

    // Get values from POST from the client
    const username = req.body.username;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const hash = req.body.hash;
    const salt = req.body.salt;
    const streetAddress = req.body.streetAddress;
    const city = req.body.city;
    const state = req.body.state;
    const zip = req.body.zip;
    const dodaffiliation = req.body.dodaffiliation;
    const dodstatus = req.body.dodstatus;
    const rank = req.body.rank;

    let userType = 'customer';


    console.log("register.js: username: " + username + " salt: " + salt + " hash: " + hash);
    let sql = "CALL register_user(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  @result); select @result";
    dbCon.query(sql, [username, firstname, lastname, email, phoneNumber, hash, salt, streetAddress, city, state, zip, dodaffiliation, dodstatus, rank, userType], function (err, rows) {
        if (err) {
            throw err;
        }
        if (rows[1][0]['@result'] == 0) {
            // Successful registration!
            // Set the sessions variable for this
            req.session.username = username;
            req.session.loggedIn = true;

            // Since session updates aren't synchronous and automatic because they are inserted into the MySQL database
            // we have to wait for the database to come back with a result.  req.session.save() will trigger a function when 
            // the save completes
            req.session.save(function (err) {
                if (err) {
                    throw err;
                }
                console.log("register.js: Successful registration, a session field is: " + req.session.username);

                // Redirect the user to the home page.  Let that redirect the user to the next correct spot.
                res.redirect('/home');
            });
        } else if (rows[1][0]['@result'] == 1) {
            console.log("register.js: Username already exists.  Reload register page with that message.");
            return res.render('register', {
                message: "The username '" + username + "' already exists",
                formData: {
                    username,
                    firstname,
                    lastname,
                    email,
                    phoneNumber,
                    streetAddress,
                    city,
                    state,
                    zip,
                    dodaffiliation,
                    dodstatus,
                    rank
                }
            });

        }
        else if (rows[1][0]['@result'] == 2) {
            console.log("register.js: Email already exists.  Reload register page with that message.");
            return res.render('register', {
                message: "The Email address '" + email + "' already exists",
                formData: {
                    username,
                    firstname,
                    lastname,
                    email,
                    phoneNumber,
                    streetAddress,
                    city,
                    state,
                    zip,
                    dodaffiliation,
                    dodstatus,
                    rank
                }
            });
        }
    });
});

module.exports = router;