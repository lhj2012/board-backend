var express = require("express");
var router = express.Router();
let dbService = require("../services/db-service");
let jwt = require("jsonwebtoken");
let authenticate = require("../services/auth-service");

// Get All Articles
router.get("/", async (req, res) => {
    try {
        let db = await dbService.getDbServiceInstance();
        const articles = await db.getArticles();
        res.json(articles);
    } catch (err) {
        console.log(err);
    }
});

// Add an Article
router.post("/add", authenticate, async (req, res) => {
    console.log("Trying to add an article here..");

    try {
        let db = await dbService.getDbServiceInstance();
        const [user] = await db.getUser(req.email);
        if (!user) {
            return res.json(false);
        }
        let article = {};
        article.user_id = user.user_id;
        article.title = req.body.title;
        article.body = req.body.body;

        // return res.json(true);
        await db.insertArticle(article);
        res.json(true);
    } catch (err) {
        console.log(err);
    }
});

// Get Single Article
router.get("/:id", async (req, res) => {
    try {
        let db = await dbService.getDbServiceInstance();
        const [article] = await db.getArticle(req.params.id);
        res.json(article);
    } catch (err) {
        console.log(err);
    }
});

// Update Single Article
router.post("/:id", async (req, res) => {
    console.log("update called");
    let article = {};
    article.article_id = req.body.article_id;
    article.title = req.body.title;
    article.body = req.body.body;
    try {
        let db = await dbService.getDbServiceInstance();
        await db.updateArticle(article);
    } catch (err) {
        console.log(err);
    }
});

// Delete Single Article
router.delete("/:id", async (req, res) => {
    try {
        let db = await dbService.getDbServiceInstance();
        await db.deleteArticle(req.params.id);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
