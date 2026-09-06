const express = require('express');
const router = express.Router();
const NewsModel = require('../models/newsModel');

// Helper function to turn article titles into SEO-friendly slugs if no slug exists
const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove non-word characters
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
};

router.get('/sitemap.xml', async (req, res) => {
  try {
    const articles = await NewsModel.getArticles();
    const baseUrl = 'https://palghardrushti.in';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Homepage Entry
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 2. Article Entries
    articles.forEach((article) => {
      if (article.status && article.status !== 'published') return;

      const rawDate = article.updatedAt || article.createdAt || article.publishedAt;
      const parsedDate = rawDate ? new Date(rawDate) : new Date();
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      const lastModDate = validDate.toISOString().split('T')[0];

      // Prioritize article.slug, fallback to slugifying article.title, then fallback to ID
      const articleSlug = article.slug || slugify(article.title) || article.id || article._id;

      if (!articleSlug) return;

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/news/${articleSlug}</loc>\n`;
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