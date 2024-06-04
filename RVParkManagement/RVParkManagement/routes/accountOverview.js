var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("accountOverview.js: GET");

  const username = req.session.username;
  const userRoleId = req.session.userRoleId;
  console.log("accountoverview.js: the userRoleId is: ", userRoleId);
  let sql = "SELECT first_name, last_name, email, phone_number, street_address, city, state, zip, dod_affiliation, dod_status, military_rank FROM users WHERE username = ? LIMIT 1";
  dbCon.query(sql, [username], function (err, row) {
    if (err) {
      throw err;
    }
    res.render('accountOverview', { users: row, userRoleId });
  });


});

module.exports = router;
