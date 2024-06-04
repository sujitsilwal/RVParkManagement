var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');
const { format } = require('mysql2');

// Function to format a date as mm/dd/yyyy
// function formatDate(date) {
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   const year = date.getFullYear();
//   return year + '-' + month + '-' + day;
// }


function setTimeTo13(inputDate) {

  // Set the time to 13:00:00 (1:00 PM)
  inputDate.setHours(13, 0, 0, 0);

  return inputDate;
}


/* GET page. */
router.get('/', function (req, res, next) {
  console.log("manageReservations.js: GET");

  // query DB to get userId
  const userName = req.session.username;
  console.log("This is the userName: ", userName);

  var userId;
  let sql = "SELECT user_id\n" +
    "FROM users\n" +
    "WHERE username = '" + userName + "';\n";

  dbCon.query(sql, function (err, results) {
    if (err) {
      console.log("index.js: Query to find userId failed");
      throw err;
    }
    if (results.length > 0) {
      userId = parseInt(results[0].user_id);
      req.session.userId = userId;
      console.log("loginuser.js: The userId is: ", userId);

      sql = "CALL get_reservations(?, ?);";
      dbCon.query(sql, [userId, 'Active'], function (err, reservationResult) {
        if (err) {
          console.log("manageReservations.js: procedure get_reservations failed");
          throw err;
        }

        if (reservationResult.length > 0) {
          const result = reservationResult[0];
          console.log("manageReservations.js: this is the summary info: ", result);
          res.render('manageReservations', { result: result });
        }
        else {
          console.log("manageReservations.js: the reservationResult is empty");
          res.render('manageReservations', { result: [] });
        }
      });
    } else {
      console.log("No userId found with the username provided");
      console.log("This is the userName: ", userName);
      res.render('manageReservations', { result: [] });
    }
  });
});


/* POST page*/
router.post('/', function (req, res, next) {
  console.log("manageReservations.js: POST");

  //run cancel reservation here
  var user_id = req.session.userId;
  var reservation_id = req.body.reservation_id;
  console.log("manageReservations.js: POST - This is the userID: ", user_id);
  console.log("manageReservations.js: POST - This is the reservationID: ", reservation_id);

  let sql = "CALL cancel_reservation(?);";
  dbCon.query(sql, [reservation_id], function (err, result) {
    if (err) {
      console.log("manageReservations.js: procedurecancel_reservations failed");
      throw err;
    }

    if (result.lenth > 0) {
      console.log("manageReservations.js: POST - reservation was canceled successfully");
    }

    sql = "CALL refund_payment(?);";
    dbCon.query(sql, [reservation_id], function (err, result) {
      if (err) {
        console.log("manageReservations.js: refund_payment method failed");
        throw err;
      }

      if (result.lenth > 0) {
        console.log("manageReservations.js: Payment was refunded");
      }

      sql = "SELECT payments.card_number\n" +
        "FROM payments\n" +
        "JOIN reservations ON reservations.payment_id = payments.payment_id\n" +
        "WHERE reservations.reservation_id = (?);\n";
      dbCon.query(sql, [reservation_id], function (err, results) {
        if (err) {
          throw err;
        }
        if (results.length > 0) {
          cardNumber = results[0].card_number;
        }

        sql = "SELECT sites.price_per_night, reservations.from_date, reservation_types.reservation_type\n" +
          "FROM sites\n" +
          "JOIN reservations ON reservations.site_id = sites.site_id\n" +
          "JOIN reservation_types ON reservations.reservation_type_id = reservation_types.reservation_type_id\n" +
          "WHERE reservations.reservation_id = (?);\n";
        dbCon.query(sql, [reservation_id], function (err, results) {
          if (err) {
            throw err;
          }

          if (results.length > 0) {
            pricePerNight = results[0].price_per_night;
            fromDate = results[0].from_date;
            reservationType = results[0].reservation_type;
          }
          console.log("Price Per Night: " + pricePerNight);

          var fromDateObj = new Date(fromDate); // Convert fromDateObj to a Date object
          fromDateObj = setTimeTo13(fromDateObj);
          var todaysDateObj = new Date(); // Convert todaysDate to a Date object

          console.log("Todays Date: " + todaysDateObj);
          console.log("From Date: " + fromDateObj);
          const oneDay = 24 * 60 * 60 * 1000;
          const daysDifference = Math.ceil(Math.abs((todaysDateObj - fromDateObj) / oneDay));

          console.log("Days Difference: " + daysDifference);

          var cancellationFee;
          if (daysDifference <= 3) {
            cancellationFee = pricePerNight;
            if(reservationType == "Storage"){
              cancellationFee = 10;
            }
          }
          else {
            cancellationFee = 10;
            if(reservationType == "Storage"){
              cancellationFee = 5;
            }
          }
          sql = "CALL make_payment(?, ?, ?, ?, ?, ?, @result); SELECT @result";
          dbCon.query(sql, [cardNumber, cancellationFee, todaysDateObj, 'Active', 'Cancellation Fee', req.session.userId], function (err, results) {
            if (err) {
              console.log("manageReservations.js: refund_payment method failed");
              throw err;
            }
            const paymentId = results[1][0]['@result'];
            console.log("Payment ID:", paymentId);

            if (result.lenth > 0) {
              console.log("manageReservations.js: Payment was refunded");
            }

            res.redirect('/manageReservations');
          });
        });
      });
    });
  });
});


module.exports = router;
