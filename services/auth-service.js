const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).json({ msg: "no token" });
        }
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!verified) {
            return res.status(401).json({ msg: "wrong token" });
        }
        req.email = verified.email;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = authenticate;
