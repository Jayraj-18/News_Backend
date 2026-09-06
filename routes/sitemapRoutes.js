const express = require('express');
const router = express.Router();
const NewsModel = require('../models/newsModel');

// Marathi Devanagari slug generator — returns RAW Devanagari, no percent-encoding
const makeUnicodeSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .replace(/[\s\t\n]+/g, '-')              // Replace spaces with hyphens
    .replace(/[^\p{L}\p{N}\-]/gu, '');       // Keep letters, numbers, hyphens
};

// Escape only what XML requires — do NOT percent-encode
const escapeXml = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

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

      // Use titleMr (Marathi title) for the slug
      let slug = makeUnicodeSlug(article.titleMr || article.title);

      // Fallback only if titleMr/title is missing
      if (!slug || slug.startsWith('article-')) {
        slug = article.slug && !article.slug.startsWith('article-')
          ? article.slug
          : article.id || article._id;
      }

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/news/${escapeXml(slug)}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=UTF-8');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;