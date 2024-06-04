var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("adminManageReservations.js: GET");
  var manageReservationID = req.query.manageReservationID;

  sql = "CALL get_reservation(?);";
  dbCon.query(sql, [manageReservationID], function (err, manageReservation) {
    if (err) {
      throw err;
    }

    if (manageReservation.length > 0) {
      const reservation = manageReservation[0];
      console.log("adminManageReservations.js: this is the reservation: ", reservation);
      res.render('adminManageReservations', { reservation: reservation, manageReservationID });
    }
    else {
      console.log("adminManageReservations.js: there is not a reservation with this ID.");
      res.render('adminManageReservations', { reservation: [] });
    }
  });

});


// Function to format a date as mm/dd/yyyy
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return year + '-' + month + '-' + day;
}

const todaysDate = formatDate(new Date());

/* POST page (CANCEL)*/
router.post('/cancel', function (req, res, next) {
  console.log("adminManageReservations.js: POST (cancel)");

  //run cancel reservation here
  var reservation_id = req.body.reservation_id;
  console.log("adminManageReservations.js: POST - This is the reservationID: ", reservation_id);

  let sql = "CALL cancel_reservation(?);";
  dbCon.query(sql, [reservation_id], function (err, result) {
    if (err) {
      console.log("adminManageReservations.js: procedure cancel_reservation failed");
      throw err;
    }

    if (result.length > 0) {
      console.log("adminManageReservations.js: POST - reservation was canceled successfully");
    }

    sql = "CALL refund_payment(?);";
    dbCon.query(sql, [reservation_id], function (err, result) {
      if (err) {
        console.log("adminManageReservations.js: refund_payment method failed");
        throw err;
      }

      if (result.length > 0) {
        console.log("adminManageReservations.js: Payment was refunded");
      }

      let sql = "SELECT payments.card_number, payments.user_id\n" +
        "FROM payments\n" +
        "JOIN reservations ON reservations.payment_id = payments.payment_id\n" +
        "WHERE reservations.reservation_id = (?);\n";
      dbCon.query(sql, [reservation_id], function (err, results) {
        if (err) {
          throw err;
        }
        if (results.length > 0) {
          cardNumber = results[0].card_number;
          userId = results[0].user_id;
        }

        sql = "CALL make_payment(?, ?, ?, ?, ?, ?, @result); SELECT @result";
        dbCon.query(sql, [cardNumber, 10, todaysDate, 'Active', 'Cancellation Fee', userId], function (err, results) {
          if (err) {
            console.log("adminManageReservations.js: make_payment method failed");
            throw err;
          }
          const paymentId = results[1][0]['@result'];
          console.log("Payment ID:", paymentId);

          if (result.lenth > 0) {
            console.log("adminManageReservations.js: Cancellation fee was payed");
          }

          res.redirect('/adminManageReservations?manageReservationID=' + reservation_id);
        });
      });
    });
  });
});

/* POST page (COMPLETE)*/
router.post('/complete', function (req, res, next) {
  console.log("adminManageReservations.js: POST (complete)");

  //run cancel reservation here
  var reservation_id = req.body.reservation_id;
  console.log("adminManageReservations.js: POST - This is the reservationID: ", reservation_id);

  let sql = "CALL complete_reservation(?);";
  dbCon.query(sql, [reservation_id], function (err, result) {
    if (err) {
      console.log("adminManageReservations.js: procedure complete_reservation failed");
      throw err;
    }

    if (result.length > 0) {
      console.log("adminManageReservations.js: POST - reservation was completed successfully");
    }

    res.redirect('/adminManageReservations?manageReservationID=' + reservation_id);
  });
});


module.exports = router;
