var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("holidayDates.js: GET");

    let sql = "CALL get_holiday_dates();";
    dbCon.query(sql, function (err, result) {
        if (err) {
            console.log("holidayDates.js: Query to get holiday dates failed");
            throw err;
        }
        // Pass the fetched holiday dates to the EJS template
        res.render('holidayDates', { holidayDates: result[0] });
    });
});

/* POST page*/
router.post('/', function (req, res, next) {
    console.log("holidayDates.js: POST");

    const user_id = req.session.userId;
    const holidayDate = req.body.holidayDate;
    const holidayDescription = req.body.holidayDescription;

    console.log("holidayDates.js: POST - This is the userID: ", user_id);
    console.log("holidayDates.js: POST - This is the holiday_date: ", holidayDate);

    let sql = "CALL insert_holiday_date(?, ?);";
    dbCon.query(sql, [holidayDate, holidayDescription], function (err, result) {
        if (err) {
            console.log("holidayDates.js: procedure insert_holiday_date failed");
            throw err;
        }

        if (result.lenth > 0) {
            console.log("holidayDates.js: POST - holiday was added successfully");
        }

        // sql = "CALL delete_holiday_date(?);";
        // dbCon.query(sql, [holiday_date_id], function (err, result) {
        //     if (err) {
        //         console.log("holidayDates.js: delete_holiday_date method failed");
        //         throw err;
        //     }

        //     if (result.lenth > 0) {
        //         console.log("holidayDates.js: Holiday_date was deleted");
        //     }

        res.redirect('/holidayDates');
        // });

    });
});

/* POST page for deletion */
router.post('/delete', function (req, res, next) {
    const holidayDateId = req.body.holidayDateId;

    console.log("holidayDates.js: POST (DELETE) - This is the holiday_date_id: ", holidayDateId);

    // Query to delete a holiday date
    let sql = "CALL delete_holiday_date(?);";
    dbCon.query(sql, [holidayDateId], function (err, result) {
        if (err) {
            console.log("holidayDates.js: Procedure delete_holiday_date failed");
            throw err;
        }
        console.log("holidayDates.js: Holiday date deleted successfully");
    });

    res.redirect('/holidayDates');
});

module.exports = router;

