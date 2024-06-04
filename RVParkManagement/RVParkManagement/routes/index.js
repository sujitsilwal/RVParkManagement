var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  if (req.session.loggedIn) {
    res.redirect("/home");
    console.log("User already logged in! Username: " + req.session.username);
  } else {
     res.render("index", {});
    console.log("No open session available, viewing index page.")
  }
});

router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
      if (err) {
        throw err;
      }   
      res.redirect('/'); 
  });
})

module.exports = router;
