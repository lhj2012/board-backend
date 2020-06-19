const dotenv = require("dotenv");
let db = require("mysql-promise")();
let instance = null;
dotenv.config();

try {
    db.configure({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        port: process.env.DB_PORT,
    });
    console.log("db connection: " + db.isConfigured());
} catch (err) {
    console.log(err);
}

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getArticles() {
        try {
            const queryString =
                "SELECT board.users.user_id, board.users.name, board.articles.article_id, board.articles.title, board.articles.body, board.articles.added_date FROM board.users INNER JOIN board.articles on board.users.user_id=board.articles.user_id";
            const [results] = await db.query(queryString);
            return results;
        } catch (err) {
            console.log(err);
        }
    }

    async getArticle(article_id) {
        try {
            const queryString =
                "SELECT board.users.user_id, board.users.name, board.articles.article_id, board.articles.title, board.articles.body, board.articles.added_date FROM board.users INNER JOIN board.articles on board.users.user_id=board.articles.user_id WHERE article_id = ?";
            const [result] = await db.query(queryString, [article_id]);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    async insertArticle(article) {
        try {
            const queryString =
                "INSERT INTO board.articles (user_id, title, body, added_date) VALUES (?, ?, ?, NOW());";
            await db.query(queryString, [
                article.user_id,
                article.title,
                article.body,
            ]);
        } catch (err) {
            console.log(err);
        }
    }

    async updateArticle(article) {
        try {
            const queryString =
                "UPDATE board.articles SET title=?, body=?, added_date=NOW() WHERE article_id = ?";
            await db.query(queryString, [
                article.title,
                article.body,
                article.article_id,
            ]);
            console.log("updated article");
        } catch (err) {
            console.log(err);
        }
    }

    async deleteArticle(article_id) {
        try {
            const queryString =
                "DELETE FROM board.articles WHERE article_id = ?";
            await db.query(queryString, [article_id]);
        } catch (err) {
            console.log(err);
        }
    }

    async insertUser(user) {
        try {
            const queryString =
                "INSERT INTO board.users (name, email, hashed_pwd, created_date) VALUES (?, ?, ?, NOW());";
            await db.query(queryString, [
                user.name,
                user.email,
                user.hashedPassword,
            ]);
        } catch (err) {
            console.log(err);
        }
    }

    async getUser(email) {
        try {
            const queryString =
                "SELECT * FROM board.users WHERE board.users.email = ?";
            const [result] = await db.query(queryString, [email]);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = DbService;
