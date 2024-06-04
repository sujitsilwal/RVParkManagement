var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("editSite.js: GET");

  const siteNumber = req.query.siteNumber;
  const message = req.query.message ? req.query.message : '';

  sql = "CALL get_site(?);";
  dbCon.query(sql, [siteNumber], function (err, manageSite) {
    if (err) {
      throw err;
    }

    if (manageSite.length > 0) {
      const site = manageSite[0];
      console.log("editSite.js: this is the site: ", site);
      res.render('editSite', { site: site, message: message });
    }
    else {
      console.log("editSite.js: there is not a site with this site_number.");
      res.render('editSite', { site: [] });
    }
  });
});

router.post('/', function (req, res, next) {
  console.log("editSite.js: POST");

  // Extract form values from the request body
  const oldSiteNumber = req.body.oldSiteNumber;
  const siteNumber = req.body.siteNumber !== '' ? req.body.siteNumber : req.body.placeholderSiteNumber;
  const type = req.body.type !== '' ? req.body.type : req.body.placeholderType;
  const maxSize = req.body.maxSize !== '' ? req.body.maxSize : req.body.placeholderMaxSize;
  if (maxSize == '') {
    maxSize = null;
  }
  const pricePerNight = req.body.pricePerNight !== '' ? req.body.pricePerNight : req.body.placeholderPricePerNight;
  const siteStatus = req.body.siteStatus !== '' ? req.body.siteStatus : req.body.placeholderSiteStatus;


  // Redirect to /reservation route with form values in the request body
  //res.redirect('/reservation?type=' + type + '&rvSize=' + rvSize + '&pricePerNight=' + pricePerNight + '&fromDate=' + fromDate + '&toDate=' + toDate);
  console.log("editSite.js: siteNumber: " + siteNumber + " type: " + type + " maxSize: " + maxSize + " pricePerNight: " + pricePerNight + " siteStatus: " + siteStatus);
  let sql = "CALL edit_site(?, ?, ?, ?, ?, ?, ?, @result); select @result;";
  dbCon.query(sql, [req.session.username, oldSiteNumber, siteNumber, maxSize, pricePerNight, siteStatus, type], function (err, rows) {
    if (err) {
      throw err;
    }
    if (rows[1][0]['@result'] == 0) {

      console.log("editSite.js: Successful site addition");

      // Redirect the user to the home page.  Let that redirect the user to the next correct spot.
      res.redirect('editSiteInput');

    } else if (rows[1][0]['@result'] == 1) {
      console.log("editSite.js: That Site Number already exists.  Reload editSite page with that message.");
      return res.redirect('editSite?siteNumber=' + oldSiteNumber + "&message=The site_number '" + siteNumber + "' already exists.");
    }

    else if (rows[1][0]['@result'] == 2) {
      console.log("editSite.js: Cannot Close Site " + oldSiteNumber + " due to it having open reservations.");
      return res.redirect('editSite?siteNumber=' + oldSiteNumber + "&message=Cannot Close Site " + oldSiteNumber + " due to it having open reservations.");
    }

  });
});

module.exports = router;
