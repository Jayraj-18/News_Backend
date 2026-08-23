const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const verifyAdmin = require('../middleware/auth'); // Import your Firebase auth middleware

// Base Route: /api/articles
router.route('/')
  .get(articleController.getAllArticles) // Public route for reading news
  .post(verifyAdmin, articleController.createArticle); // Protected route (requires valid Firebase token)

router.route('/:id')
  .get(articleController.getArticleById) // Public route for reading single article
  .put(verifyAdmin, articleController.updateArticle) // Protected route
  .delete(verifyAdmin, articleController.deleteArticle); // Protected route

module.exports = router;