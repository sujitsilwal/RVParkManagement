var express = require('express');
const { user } = require('../lib/connectionInfo');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  // query DB to get userId
  const username = req.session.username;
  console.log("This is the userName: ",username);

  var userId;
  let sql = "SELECT user_id\n" +
    "FROM users\n" +
    "WHERE username = (?);\n";

  dbCon.query(sql,[username], function (err, results) {
    if (err) {
      throw err;
    }
    if (results.length > 0) {
      userId = parseInt(results[0].user_id);
      req.session.userId = userId;
      console.log("The userId is: ", userId);

      sql = "CALL get_reservations(?, ?);";
      dbCon.query(sql, [userId, ""], function (err, reservationResult) {
        if (err) {
          console.log("reservationHistory.js: procedure get_reservations failed");
          throw err;
        }

        if (reservationResult.length > 0) {
          const result = reservationResult[0];
          console.log("reservationHistory.js: this is the summary info: ", result);
          res.render('reservationHistory', { result: result });
        }
        else {
          console.log("reservationHistory.js: the reservationResult is empty");
          res.render('reservationHistory', { result: [] });
        }
      });
    } else {
      console.log("No userId found with the username provided");
      console.log("This is the userName: ", userName);
      res.render('reservationHistory', { result: [] });
    }
  });
});

module.exports = router;
