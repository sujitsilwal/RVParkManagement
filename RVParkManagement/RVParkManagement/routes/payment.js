var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

// Function to format a date as mm/dd/yyyy
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return year + '-' + month + '-' + day;
}

// Function to parse yyyy-mm-dd formatted date strings into Date objects
function parseDate(dateString) {
  console.log(dateString);
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return new Date(year, month - 1, day); // Month in JavaScript Date object is 0-based
}


/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("payment.js: GET");

  const type = req.query.type;
  const pricePerNight = req.query.pricePerNight;
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  const fromDateObj = parseDate(fromDate);
  const toDateObj = parseDate(toDate);
  const oneDay = 24 * 60 * 60 * 1000;
  const daysDifference = Math.round(Math.abs((fromDateObj - toDateObj) / oneDay));
  var amount = daysDifference * pricePerNight;

  var monthInt = 0;
  var weekInt = 0;
  var monthPrice = 100;
  var weekPrice = 30;
  var dayPrice = pricePerNight; //should be $5
  allDays = daysDifference; // we are keeping it this way as it doesnt include the first day (just making it nights)

  console.log("Days Difference: " + allDays);
  if (type == "Storage"){
    if(Math.floor(allDays / 30) >= 1) {
      monthInt = Math.floor(allDays / 30);
      allDays = allDays - (monthInt * 30);
      console.log("MonthInt: " + monthInt + ", Days Left: " + allDays);
    }
    if(Math.floor(allDays / 7) >= 1){
      weekInt = Math.floor(allDays / 7);
      allDays = allDays - (weekInt * 7);
      console.log("WeekInt: " + weekInt + ", Days Left: " + allDays);
    }
    console.log("Day Price: " + dayPrice);
    amount = (monthInt * monthPrice) + (weekInt * weekPrice) + (allDays * dayPrice) //should have less than a week of days for allDays
    console.log("Storage price: $" + amount)
  }


  res.render('payment', { amount });

  var userId;
  let sql = "SELECT user_id\n" +
    "FROM users\n" +
    "WHERE username = (?);\n";

  dbCon.query(sql, [req.session.username], function (err, results) {
    if (err) {
      console.log("payment.js: Query to find userId failed");
      throw err;
    }
    if (results.length > 0) {
      userId = parseInt(results[0].user_id);
      req.session.userId = userId;
      console.log("payment.js: The userId is: ", userId);
    }
  });

});

router.post('/', function (req, res, next) {
  console.log("payment.js: POST");

  const siteId = req.query.site_id;
  const reservationType = req.query.type;
  var size = req.query.rvSize;
  if (size == '') {
    size = null;
  }
  const pricePerNight = req.query.pricePerNight;
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  const cardNumber = req.body.cardNumber;

  const fromDateObj = parseDate(fromDate);
  const toDateObj = parseDate(toDate);
  const oneDay = 24 * 60 * 60 * 1000;
  const daysDifference = Math.round(Math.abs((fromDateObj - toDateObj) / oneDay));
  var amount = daysDifference * pricePerNight;

  const todaysDate = formatDate(new Date());

  var monthInt = 0;
  var weekInt = 0;
  var monthPrice = 100;
  var weekPrice = 30;
  var dayPrice = pricePerNight; //should be $5
  allDays = daysDifference; // we are keeping it this way as it doesnt include the first day (just making it nights)

  console.log("Days Difference: " + allDays);
  if (reservationType == "Storage"){
    if(Math.floor(allDays / 30) >= 1) {
      monthInt = Math.floor(allDays / 30);
      allDays = allDays - (monthInt * 30);
      console.log("MonthInt: " + monthInt + ", Days Left: " + allDays);
    }
    if(Math.floor(allDays / 7) >= 1){
      weekInt = Math.floor(allDays / 7);
      allDays = allDays - (weekInt * 7);
      console.log("WeekInt: " + weekInt + ", Days Left: " + allDays);
    }
    console.log("Day Price: " + dayPrice);
    amount = (monthInt * monthPrice) + (weekInt * weekPrice) + (allDays * dayPrice) //should have less than a week of days for allDays
    console.log("Storage price: $" + amount)
  }

  console.log("Parameters:", siteId, size, pricePerNight, fromDate, toDate);

  sql = "CALL make_payment(?, ?, ?, ?, ?, ?, @result); SELECT @result";
  dbCon.query(sql, [cardNumber, amount, todaysDate, 'Active', 'New Reservation', req.session.userId], function (err, results) {
    if (err) {
      throw err;
    }
    const paymentId = results[1][0]['@result'];
    console.log("Payment ID:", paymentId);

    sql = "CALL create_reservation(?, ?, ?, ?, ?, ?, ?, ?, ?, @result); SELECT @result";
    dbCon.query(sql, [req.session.userId, reservationType, siteId, paymentId, size, todaysDate, 'Active', fromDate, toDate], function (err, results) {
      if (err) {
        throw err;
      }
      const reservationId = results[1][0]['@result'];
      console.log("Reservation ID:", reservationId);

      res.redirect('confirmation?reservation_id=' + reservationId)
    });
  });
});

module.exports = router;

