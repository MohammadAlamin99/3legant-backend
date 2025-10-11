// var jwt = require('jsonwebtoken');

// function authorize(allowedRoles = []) {
//     return (req, res, next) => {
//         let token = req.headers.token;
//         if (!token) {
//             return res.status(401).json({
//                 status: "unauthorized"
//             })
//         }
//         jwt.verify(token, process.env.secret_key, (err, decoded) => {
//             if (err) {
//                 return res.status(401).json({
//                     status: "unauthorized"
//                 })
//             }
//             else {
//                 let { email, role } = decoded;
//                 req.user = { email, role };
//                 if (allowedRoles.length && !allowedRoles.includes(role)) {
//                     return res.status(403).json({
//                         status: "forbidden",
//                         message: "You dont have permission to access this resource",
//                     })
//                 }
//                 next()
//             }
//         })
//     }
// }
// module.exports = authorize;

var jwt = require('jsonwebtoken');

function authorize(allowedRoles = []) {
    return (req, res, next) => {
        const token = req.headers.token || req.headers.authorization?.split(" ")[1]; // support Bearer token
        if (!token) {
            return res.status(401).json({
                status: "unauthorized",
                message: "Token missing"
            });
        }

        jwt.verify(token, process.env.secret_key, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    status: "unauthorized",
                    message: "Invalid token"
                });
            }

            const { userId, email, role } = decoded; // include userId
            req.user = { userId, email, role };

            if (allowedRoles.length && !allowedRoles.includes(role)) {
                return res.status(403).json({
                    status: "forbidden",
                    message: "You don't have permission to access this resource",
                });
            }

            next();
        });
    };
}

module.exports = authorize;
