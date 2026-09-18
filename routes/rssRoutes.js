const express = require('express');
const RSS = require('rss');
const NewsModel = require('../models/newsModel');
const { normalizeSlug } = require('../utils/slugify');

const router = express.Router();
const BASE_URL = 'https://palghardrushti.in';
const FEED_URL = `${BASE_URL}/rss.xml`;
const RSS_CACHE_TTL_MS = 60 * 1000;
let feedCache = { xml: null, expiresAt: 0 };

const getArticleSlug = (article) => normalizeSlug(article.slug)
  || normalizeSlug(article.titleMr || article.titleEn)
  || String(article.id || '');

const stripHtml = (value) => String(value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const makeExcerpt = (article) => {
  const source = stripHtml(article.summaryMr) || stripHtml(article.contentMr);
  if (source.length <= 240) return source;
  return `${source.slice(0, 237).trim()}...`;
};

const getArticleDate = (article) => {
  const parsed = new Date(article.publishedAt || article.createdAt || article.updatedAt || 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getImageUrl = (article) => {
  const rawUrl = typeof article.featuredImage === 'string'
    ? article.featuredImage
    : article.featuredImage?.url;
  if (!rawUrl || rawUrl.startsWith('data:image')) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  return `${BASE_URL}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`;
};

router.get('/rss.xml', async (req, res) => {
  try {
    const now = Date.now();
    if (feedCache.xml && feedCache.expiresAt > now) {
      res.type('application/rss+xml; charset=utf-8');
      return res.status(200).send(feedCache.xml);
    }

    const articles = (await NewsModel.getArticlesForFeed())
      .sort((first, second) => (getArticleDate(second)?.getTime() || 0) - (getArticleDate(first)?.getTime() || 0))
      .slice(0, 20);

    const feed = new RSS({
      title: 'पालघर दृष्टी',
      description: 'पालघर जिल्ह्यातील ताज्या आणि विश्वासार्ह बातम्या',
      site_url: `${BASE_URL}/`,
      feed_url: FEED_URL,
      language: 'mr',
      pubDate: new Date(),
      copyright: 'पालघर दृष्टी'
    });

    articles.forEach((article) => {
      const url = `${BASE_URL}/news/${encodeURIComponent(getArticleSlug(article))}`;
      const date = getArticleDate(article) || new Date();
      const imageUrl = getImageUrl(article);
      const item = {
        title: article.titleMr || 'पालघर दृष्टी बातमी',
        description: makeExcerpt(article),
        url,
        guid: url,
        date,
        author: article.author?.name || 'पालघर दृष्टी',
        categories: article.category ? [article.category] : undefined
      };

      if (imageUrl) {
        item.enclosure = { url: imageUrl };
      }

      feed.item(item);
    });

    feedCache = { xml: feed.xml({ indent: true }), expiresAt: now + RSS_CACHE_TTL_MS };
    res.type('application/rss+xml; charset=utf-8');
    return res.status(200).send(feedCache.xml);
  } catch (error) {
    console.error('RSS feed generation error:', error);
    return res.status(500).json({ success: false, message: 'RSS feed temporarily unavailable' });
  }
});

module.exports = router;