var jwt = require("jsonwebtoken");

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    let token = req.headers.token;
    if (!token) {
      return res.status(401).json({
        status: "unauthorized",
      });
    }
    jwt.verify(token, process.env.secret_key, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: "unauthorized",
        });
      } else {
        let { userId, email, role } = decoded;
        req.user = { userId, email, role };
        if (allowedRoles.length && !allowedRoles.includes(role)) {
          return res.status(403).json({
            status: "forbidden",
            message: "You dont have permission to access this resource",
          });
        }
        next();
      }
    });
  };
}
module.exports = authorize;
