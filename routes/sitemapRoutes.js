// routes/sitemapRoutes.js
const express = require('express');
const router = express.Router();
const Article = require('../models/newsModel'); // Import your Article model

router.get('/sitemap.xml', async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ createdAt: -1 });

    const baseUrl = 'https://palghardrushti.netlify.app';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Homepage Entry
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 2. Dynamic Article Entries
    articles.forEach((article) => {
      const lastModDate = new Date(article.updatedAt || article.createdAt)
        .toISOString()
        .split('T')[0];

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/article/${article._id}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    return res.status(500).end();
  }
});

module.exports = router;