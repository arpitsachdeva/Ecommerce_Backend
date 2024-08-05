const checkAdmin = (req, res, next) =>{
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
        status: 403,
      });
    }
    next();
  }
  
  module.exports = checkAdmin