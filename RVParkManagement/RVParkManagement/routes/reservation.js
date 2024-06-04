var express = require('express');
var router = express.Router();
var app = express();

app.use(express.static('public'));

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("reservation.js: POST");

  const reservationType = req.query.type;
  var size = req.query.rvSize;
  const pricePerNight = req.query.pricePerNight;
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  if (size == '') {
    size = null;
  }

  console.log("Parameters:", reservationType, size, pricePerNight, fromDate, toDate);

  var userId;
  let sql = "SELECT user_id\n" +
    "FROM users\n" +
    "WHERE username = (?);\n";

  dbCon.query(sql, [req.session.username], function (err, results) {
    if (err) {
      console.log("reservation.js: Query to find userId failed");
      throw err;
    }
    if (results.length > 0) {
      userId = parseInt(results[0].user_id);
      req.session.userId = userId;
      console.log("reservation.js: The userId is: ", userId);
    }
  });

  sql = "CALL check_availability(?, ?, ?, ?, ?);";
  dbCon.query(sql, [reservationType, size, pricePerNight, fromDate, toDate], function (err, openSiteReservations) {
    if (err) {
      throw err;
    }

    if (openSiteReservations.length > 0) {
      const siteReservations = openSiteReservations[0];
      console.log("reservation.js: these are the open reservations: ", siteReservations);
      res.render('reservation', { siteReservations: siteReservations, size, fromDate, toDate, reservationType });
    }
    else {
      console.log("reservation.js: there are no open reservations with these parameters.");
      res.render('reservation', { siteReservations: [] });
    }
  });
});

router.post('/', function (req, res, next) {
  console.log("reservation.js: POST");

  const siteId = req.body.site_id;
  const reservationType = req.body.reservation_type;
  const size = req.body.size;
  const pricePerNight = req.body.pricePerNight;
  const fromDate = req.body.fromDate;
  const toDate = req.body.toDate;

  res.redirect('/payment?site_id=' + siteId + '&type=' + reservationType + '&rvSize=' + size + '&pricePerNight=' + pricePerNight + '&fromDate=' + fromDate + '&toDate=' + toDate);
});

module.exports = router;
