const express = require("express");
const passport = require("passport");
const router = express.Router();

//start google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

//google calback url
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect:
      "https://confera-kwc0fdmy2-somu9008s-projects.vercel.app/dashboard",
  })
);

// This route returns current logged-in user
router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    // User logged in via Google OAuth (Passport)
    return res.status(200).json(req.user);
  } else if (req.session.user) {
    // User logged in via custom auth
    console.log(req.session.user);
    return res.status(200).json(req.session.user);
  } else {
    // Should never get here because middleware prevents unauthorized
    return res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;

//logout

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout error" });
    }
    res.clearCookie("connect.sid"); // optional
    res.status(200).json({ message: "Logged out" });
  });
});

module.exports = router;
