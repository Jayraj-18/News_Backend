const NewsModel = require('../models/newsModel');

// POST /api/articles
exports.createArticle = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body cannot be empty'
      });
    }

    const article = await NewsModel.createArticle(req.body);

    return res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    console.error('❌ Error creating article:', error);
    next(error);
  }
};

// GET /api/articles
exports.getAllArticles = async (req, res, next) => {
  try {
    const { category } = req.query;
    const articles = await NewsModel.getArticles(category);

    // Let browsers and CDNs cache the list for 1 min; serve stale up to 5 min while revalidating
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    return res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    next(error);
  }
};

// GET /api/articles/:id
exports.getArticleById = async (req, res, next) => {
  try {
    const article = await NewsModel.getArticleById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('❌ Error fetching article:', error);
    next(error);
  }
};

// PUT /api/articles/:id
exports.updateArticle = async (req, res, next) => {
  try {
    const updatedArticle = await NewsModel.updateArticle(req.params.id, req.body);

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle
    });
  } catch (error) {
    console.error('❌ Error updating article:', error);
    next(error);
  }
};

// DELETE /api/articles/:id
exports.deleteArticle = async (req, res, next) => {
  try {
    const deleted = await NewsModel.deleteArticle(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting article:', error);
    next(error);
  }
};