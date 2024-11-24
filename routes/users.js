const express = require("express");
const User = require("../models/user");
const router = express.Router();
const passport = require("passport");
const authenticate = require("../authenticate");

/* GET users listing. */
router.get(
  "/",
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res, next) => {
    User.find()
      .then((users) => res.json(users))
      .catch(next);
  }
);

router.post("/signup", (req, res) => {
  const user = new User({ username: req.body.username });
  User.register(user, req.body.password)
    .then((registeredUser) => {
      if (req.body.firstname) {
        registeredUser.firstname = req.body.firstname;
      }
      if (req.body.lastname) {
        registeredUser.lastname = req.body.lastname;
      }
      return registeredUser.save();
    })
    .then(() => {
      passport.authenticate("local")(req, res, () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "Registration Successful!" });
      });
    })
    .catch((err) => {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ err: err });
    });
});

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res, next) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token: token,
      status: "You are successfully logged in!",
    });
  }
);

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    const err = new Error("You are not logged in!");
    err.status = 403;
    return next(err);
  }
});
module.exports = router;
