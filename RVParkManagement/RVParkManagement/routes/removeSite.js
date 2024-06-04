var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("removeSite.js: GET");
  const siteNumber = req.query.siteNumber;
  const message = req.query.message ? req.query.message : '';

  sql = "CALL get_site(?);";
  dbCon.query(sql, [siteNumber], function (err, manageSite) {
    if (err) {
      throw err;
    }

    if (manageSite.length > 0) {
      const site = manageSite[0];
      console.log("removeSite.js: this is the site: ", site);
      res.render('removeSite', { site: site, message: message, isPost: false });
    }
    else {
      console.log("removeSite.js: there is not a site with this Site Number.");
      res.render('removeSite', { site: [], isPost: false });
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

/* POST page*/
router.post('/', function (req, res, next) {
  console.log("removeSite.js: POST");

  //run cancel reservation here
  const siteNumber = req.body.siteNumber;
  console.log("removeSite.js: POST - This is the site Number: ", siteNumber);

  const siteStatus = req.body.siteStatus;
  console.log("removeSite.js: POST - This is the current status of the site: ", siteStatus);

  let sql = "";


  if (siteStatus === "Active") {
    sql = "CALL remove_site(?, ?, ?, @result); select @result;";
    dbCon.query(sql, [req.session.username, siteNumber, 'Closed'], function (err, rows) {
      if (err) {
        console.log("removeSite.js: procedure remove_site failed (active)");
        throw err;
      }
      console.log("Procedure Successfully Ran - Result: " + rows[1][0]['@result']);

      if (rows[1][0]['@result'] ==0)  {
        console.log("removeSite.js: POST - site was removed successfully");
        res.redirect('/removeSite?siteNumber=' + siteNumber);
      }
      else if(rows[1][0]['@result'] == 1){
        console.log("removeSite.js: POST - site could not be removed");
        res.redirect('/removeSite?siteNumber=' + siteNumber + "&message=Site " + siteNumber + " could Not be changed to 'Closed' due to open Reservations on this site.");
      }
    });
  } else if (siteStatus === "Closed") {
    sql = "CALL remove_site(?, ?, ?, @result); select @result;";
    dbCon.query(sql, [req.session.username, siteNumber, 'Active'], function (err, rows) {
      if (err) {
        console.log("removeSite.js: procedure remove_site failed (closed)");
        throw err;
      }

      console.log("Procedure Successfully Ran - Result: " + rows[1][0]['@result']);

      if (rows[1][0]['@result'] == 0) {
        console.log("removeSite.js: POST - site was opened successfully");
        res.redirect('/removeSite?siteNumber=' + siteNumber);
      }
      else if(rows[1][0]['@result'] == 1){
        console.log("removeSite.js: POST - site could not be removed");
        res.redirect('/removeSite?siteNumber=' + siteNumber + "&message=Site " + siteNumber + " could Not be changed to 'Active', unknown error");
      }
    });
  }
});


module.exports = router;
