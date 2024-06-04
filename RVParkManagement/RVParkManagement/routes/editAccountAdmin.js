var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
    var userToEdit = req.query.userToEdit;
    var admin = req.session.username;

    let sql = "SELECT user_id FROM users WHERE username = (?)"
    dbCon.query(sql, [admin], function (err, adminResult) {
        if (err) {
            console.log("editAccountAdmin.js: query to get user info failed");
            throw err;
        }
        if (adminResult.length > 0) {
            console.log("editAccountAdmin.js: the admin's info is: ", adminResult[0]);
        }


        sql = "CALL get_user_info('" + userToEdit + "');";
        dbCon.query(sql, function (err, userResult) {
            if (err) {
                console.log("editAccountAdmin.js: query to get user info failed");
                throw err;
            }
            if (userResult.length > 0) {
                console.log("editAccountAdmin.js: the user's info is: ", userResult);
            }

            sql = "CALL get_usertype_id(?);";
            dbCon.query(sql, [adminResult[0].user_id], function (err, adminResult) {
                if (err) {
                    console.log("editAccountAdmin.js: query to get user info failed");
                    throw err;
                }
                if (adminResult.length > 0) {
                    console.log("editAccountAdmin.js: the admins's type is: ", adminResult[0]);

                    res.render('editAccountAdmin', { result: userResult, adminResults: adminResult[0] });
                }
            })
        })
    });
});


/* POST page. */
router.post('/', function (req, res, next) {

    console.log("editAccountAdmin.js: POST");
    const formType = req.body.formType;

    if (formType === "infoForm") {
        console.log("inside the infoForm");

        var username = req.body.usernameToEdit;
        const first_name = req.body.firstName !== '' ? req.body.firstName : req.body.placeholderFirstName;
        console.log("this is the placeholderfirstname: ", req.body.placeholderFirstName);
        console.log("this is the first_name to change: ", first_name);
        const last_name = req.body.lastName !== '' ? req.body.lastName : req.body.placeholderLastName;

        const email = req.body.email !== '' ? req.body.email : req.body.placeholderEmail;

        const phone_number = req.body.phone !== '' ? req.body.phone : req.body.placeholderPhoneNumber;

        const street_address = req.body.street !== '' ? req.body.street : req.body.placeholderStreet;

        const city = req.body.city !== '' ? req.body.city : req.body.placeholderCity;

        const state = req.body.state !== '' ? req.body.state : req.body.placeholderState;

        const zip = req.body.zip !== '' ? req.body.zip : req.body.placeholderZip;

        const userRoleId = req.body.usertype !== '' ? req.body.usertype : req.body.placeholderUserType;
        console.log("this is the userRold: ", userRoleId);
        console.log("editAccountAdmin.js: the userName to edit is: ", username);
        // query DB to get the userId of the user being edited
        var userId;
        let sql = "SELECT user_id\n" +
            "FROM users\n" +
            "WHERE username = '" + username + "';\n";
        dbCon.query(sql, function (err, results) {
            if (err) {
                console.log("index.js: Query to find userId failed");
                throw err;
            }
            if (results.length > 0) {
                userId = parseInt(results[0].user_id);
                console.log("loginuser.js: The userId of the user being edited is: ", userId);

                username = req.body.username !== '' ? req.body.username : req.body.placeholderUserName;

                sql = "CALL edit_user_details (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @result); select @result";
                dbCon.query(sql, [userId, username, first_name, last_name, email, phone_number, street_address,
                    city, state, zip, userRoleId], function (err, rows) {
                        if (err) {
                            console.log("editAccountAdmin.js: POST - edit user details procedure failed");
                            throw err;
                        }
                        console.log("editAccountAdmin.js: POST - this is the content of rows: ", rows);
                        console.log("editAccountAdmin.js: POST - this is the content of result: ", rows[1][0]['@result']);
                        
                        //if (rows.affectedRows > 0) {
                        if (rows[1][0]['@result'] === 1) {
                            console.log("editAccountAdmin.js: user's info successfully changed");
                            //const redirectUrl = '/editAccountAdmin?userToEdit=' + username + '&message=' + encodeURIComponent("Info changed successfully!");
                            //res.redirect(redirectUrl);
                            //res.redirect('/editAccountAdmin?userToEdit=' + username);
                            res.redirect('adminview');
                        }
                        else {
                            const redirectUrl = '/editAccountAdmin?userToEdit=' + username + '&message=' + encodeURIComponent("Failed to change info.");
                            res.redirect(redirectUrl);
                        }
                    });
            } else {
                console.log("No userId found with the username provided");
                console.log("This is the userName: ", username);
                res.redirect('/editAccountAdmin?userToEdit=' + username);
            }
        });
    }

    else if (formType === "passwordForm") {
        // Get values from the POST of the change password form the client
        const username = req.body.usernameToEdit;
        console.log("editAccountAdmin.js: the userName is: ", username);
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

            res.redirect('/editAccountAdmin?userToEdit=' + username);
        });
    }
});
module.exports = router;
