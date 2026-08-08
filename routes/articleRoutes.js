const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Base Route: /api/articles
router.route('/')
  .get(articleController.getAllArticles)
  .post(articleController.createArticle);

router.route('/:id')
  .get(articleController.getArticleById)
  .put(articleController.updateArticle)
  .delete(articleController.deleteArticle);

module.exports = router;