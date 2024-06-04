var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("addSite.js: GET");
  res.render('addSite', { formData: {} });
});

router.post('/', function (req, res, next) {
  console.log("addSite.js: POST");

  // Extract form values from the request body
  const siteNumber = req.body.siteNumber;
  const type = req.body.type;
  var maxSize = req.body.maxSize;
  if (maxSize == '') {
    maxSize = null;
  }
  const pricePerNight = req.body.pricePerNight;
  const siteStatus = req.body.siteStatus;


  // Redirect to /reservation route with form values in the request body
  //res.redirect('/reservation?type=' + type + '&rvSize=' + rvSize + '&pricePerNight=' + pricePerNight + '&fromDate=' + fromDate + '&toDate=' + toDate);
  console.log("addSite.js: siteNumber: " + siteNumber + " type: " + type + " maxSize: " + maxSize + " pricePerNight: " + pricePerNight + " siteStatus: " + siteStatus);
  let sql = "CALL create_site(?, ?, ?, ?, ?, ?, @result); select @result";
  dbCon.query(sql, [req.session.username, siteNumber, maxSize, pricePerNight, siteStatus, type], function (err, rows) {
    if (err) {
      throw err;
    }
    if (rows[1][0]['@result'] == 0) {
    

      console.log("addSite.js: Successful site addition");

        // Redirect the user to the home page.  Let that redirect the user to the next correct spot.
      res.redirect('/removeSite?siteNumber=' + siteNumber);
  
    } else if (rows[1][0]['@result'] == 1) {
      console.log("addSite.js: Site number" + siteNumber + "already exists.  Reload register page with that message.");
      return res.render('addSite', {
        message: "The site_number '" + siteNumber + "' already exists",
        formData: {
          siteNumber,
          type,
          maxSize,
          pricePerNight,
          siteStatus
        }
      });
    }
  });
});

module.exports = router;
