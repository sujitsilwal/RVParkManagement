var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("reports.js: GET");
    var reportDate = null;
    var reportName = null;

    if (req.query.date) {
        reportDate = req.query.date;

        let sql = "CALL get_reservations_by_date('" + reportDate + "');";
        dbCon.query(sql, function (err, reportResult) {
            if (err) {
                console.log("reports.js: call to get_reservations_by_date failed");
                throw err;
            }
            if (reportResult.length > 0) {
                console.log("reports.js: these are the reservations for the inputdate: ", reportResult);
                console.log("reports.js: this is the reportDate: ", reportDate);
                res.render('reports', { report: reportResult[0], reportDate, reportName });
            }
        });
    }
    else if (req.query.userReport) {
        reportName = req.query.userReport;

        let sql = "CALL get_reservations_by_username('" + reportName + "');";
        dbCon.query(sql, function (err, reportResult) {
            if (err) {
                console.log("reports.js: call to get_reservations_by_username failed");
                throw err;
            }
            if (reportResult.length > 0) {
                console.log("reports.js: these are the reservations for the inputUsername: ", reportResult);
                console.log("reports.js: this is the reportDate: ", reportDate);
                console.log("reports.js: this is the reporUsername: ", reportName);
                res.render('reports', { report: reportResult[0], reportName, reportDate });
            }
        });
    }



    // let sql = "CALL get_users;"
    // dbCon.query(sql, function (err, usersResult) {
    //     if (err) {
    //         console.log("holidayDates.js: Query to get usernames failed");
    //         throw err;
    //     }
    //     if (usersResult.length > 0) {
    //         console.log("adminview.js: these are the users' names: ", usersResult);

    //         res.render('adminView', { users: usersResult, username });
    //     }
    //     res.render('holidayDates');


    // });

    //res.render('reports');

});

module.exports = router;
