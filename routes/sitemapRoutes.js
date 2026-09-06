const express = require('express');
const router = express.Router();
const NewsModel = require('../models/newsModel');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const articles = await NewsModel.getArticles();

    // Clean base domain without a trailing slash
    const baseUrl = 'https://palghardrushti.in';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Add Homepage Entry
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 2. Add Article Entries
    articles.forEach((article) => {
      // Filter out draft/unpublished articles
      if (article.status && article.status !== 'published') return;

      // Safe date parsing to avoid route crashes
      const rawDate = article.updatedAt || article.createdAt || article.publishedAt;
      const parsedDate = rawDate ? new Date(rawDate) : new Date();
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      const lastModDate = validDate.toISOString().split('T')[0];

      // Article ID/Slug
      const articleIdentifier = article.id || article.slug || article._id;

      if (!articleIdentifier) return; // Skip if no identifier present

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/article/${articleIdentifier}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;