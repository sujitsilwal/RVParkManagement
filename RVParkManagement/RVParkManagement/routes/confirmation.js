var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {

  reservationId = req.query.reservation_id;

  sql = "CALL get_reservation(?);";
  dbCon.query(sql, [reservationId], function (err, confirmation) {
    if (err) {
      throw err;
    }

    if (confirmation.length > 0) {
      const reservationConfirmation = confirmation[0];
      console.log("confirmation.js: this is the reservation: ", reservationConfirmation);
      res.render('confirmation', { reservationConfirmation: reservationConfirmation, reservationId });
    }
    else {
      console.log("confirmation.js: there is not a reservation with these parameters.");
      res.render('confirmation', { reservationConfirmation: [] });
    }
  });

});

module.exports = router;
