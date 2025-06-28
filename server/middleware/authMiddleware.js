const authenticated = (req, res, next) => {
  if (req.isAuthenticated() || req.session.user || req.user || req.session) {
    return next();
  }

  res.status(401).json({ message: "Unauthorized" });
};

module.exports = authenticated;
