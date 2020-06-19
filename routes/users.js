var express = require("express");
var router = express.Router();
let dbService = require("../services/db-service");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let authenticate = require("../services/auth-service");

// Get current user by JWT
router.get("/", authenticate, async (req, res) => {
    let db = await dbService.getDbServiceInstance();
    const [user] = await db.getUser(req.email);
    res.json({ user_id: user.user_id, username: user.name, email: user.email });
});

// Get a User by e-mail
router.get("/:email", async function (req, res, next) {
    let db = await dbService.getDbServiceInstance();
    const [user] = await db.getUser(req.params.email);
    return res.json(user);
});

// Create a New User
router.post("/", async function (req, res, next) {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let user = {};
        user.name = req.body.name;
        user.email = req.body.email;
        user.hashedPassword = hashedPassword;
        let db = await dbService.getDbServiceInstance();
        await db.insertUser(user);
        res.json("User added");
    } catch (err) {
        console.log(err);
    }
});

// User Login
router.post("/login", async (req, res) => {
    try {
        let db = await dbService.getDbServiceInstance();
        const [user] = await db.getUser(req.body.email);
        if (!user) {
            return res.status(400).send("cannot find user");
        }

        if (await bcrypt.compare(req.body.password, user.hashed_pwd)) {
            const accessToken = jwt.sign(
                {
                    email: user.email,
                    username: user.name,
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );
            console.log("password matched");
            res.json({
                jwt: accessToken,
                user: {
                    email: user.email,
                    user_id: user.user_id,
                    username: user.name,
                },
            });
        } else {
            res.send("Please check your password");
        }
    } catch (err) {
        console.log(err);
    }
});

// Validation of JWT
router.post("/validation", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.json(false);
        }
        const verified = await jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );
        if (!verified) {
            return res.json(false);
        }
        let db = await dbService.getDbServiceInstance();
        const [user] = await db.getUser(verified.email);
        if (!user) {
            return res.json(false);
        }
        return res.json(true);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
