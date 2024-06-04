var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');


/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("editSiteInput.js: GET");

  let sql = "SELECT * FROM sites JOIN reservation_types ON reservation_types.reservation_type_id = sites.reservation_type_id ORDER BY sites.site_number ASC;";
  dbCon.query(sql, function (err, results) {
      if (err) {
          console.log("editSiteInput.js: Query to get sites failed");
          throw err;
      }
      console.log("Fetched sites:", results);
      // Pass the fetched sites to the EJS template
      res.render('editSiteInput', { sites: results });
  });

  // var userId;
  // let sql = "SELECT user_id\n" +
  //   "FROM users\n" +
  //   "WHERE username = (?);\n";


});

router.post('/', function (req, res, next) {
  console.log("editSiteInput.js: POST");

  const siteNumber = req.body.siteNumber;

  console.log("Parameters: ", siteNumber);

  res.redirect('editSite?siteNumber=' + siteNumber);

});
module.exports = router;

