var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("checkAvailability.js: GET");
  res.render('checkAvailability', {});
});

router.post('/', function (req, res, next) {
  console.log("checkAvailability.js: POST");

  // Extract form values from the request body
  const type = req.body.type;
  const rvSize = req.body.rvSize;
  const pricePerNight = req.body.pricePerNight;
  const fromDate = req.body.fromDate;
  const toDate = req.body.toDate;

  // Redirect to /reservation route with form values in the request body
  res.redirect('/reservation?type=' + type + '&rvSize=' + rvSize + '&pricePerNight=' + pricePerNight + '&fromDate=' + fromDate + '&toDate=' + toDate);

});

module.exports = router;
