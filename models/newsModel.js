const { db } = require('../config/firebase');

const ARTICLES_REF = 'articles';

// ─── In-memory server cache ───────────────────────────────────────────────
// Avoids hammering Firebase Realtime Database on every request.
// Cache is invalidated any time an article is written or deleted.
const SERVER_CACHE_TTL_MS = 30 * 1000; // 30 seconds
let _cacheData = null;       // { all: Article[], ts: number }

function invalidateCache() {
    _cacheData = null;
}

class NewsModel {
    /**
     * Create a new article in Realtime Database
     */
    static async createArticle(data = {}) {
        const articlesRef = db.ref(ARTICLES_REF);
        const newDocRef = articlesRef.push();
        const id = newDocRef.key;

        // Build payload ensuring NO properties are undefined (RTDB safety)
        const articlePayload = {
            id,
            slug: (data.slug || id).toString(),
            titleMr: (data.titleMr || '').toString(),
            summaryMr: (data.summaryMr || '').toString(),
            contentMr: (data.contentMr || '').toString(),
            category: (data.category || 'general').toString().trim().toLowerCase(),
            status: (data.status || 'published').toString(),
            isHero: Boolean(data.isHero),
            isBreaking: Boolean(data.isBreaking),
            readingTime: Number(data.readingTime) || 3,
            featuredImage: {
                url: (data.featuredImage?.url || '').toString(),
                alt: (data.featuredImage?.alt || '').toString()
            },
            author: {
                uid: (data.author?.uid || 'admin').toString(),
                name: (data.author?.name || 'Editor').toString()
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
            publishedAt: data.publishedAt || new Date().toISOString()
        };

        await newDocRef.set(articlePayload);
        invalidateCache();
        return articlePayload;
    }

    /**
     * Fetch all articles (optional category filtering)
     */
    static async getArticles(category = null) {
        const now = Date.now();

        // Serve from in-memory cache when fresh and no category filter
        // (category-filtered requests are fast subset operations on the cached list)
        if (_cacheData && (now - _cacheData.ts) < SERVER_CACHE_TTL_MS) {
            let list = _cacheData.all;
            if (category) {
                const lowerCat = category.toLowerCase();
                list = list.filter((art) => (art.category || '').toLowerCase() === lowerCat);
            }
            return list;
        }

        // Cache miss — fetch from Firebase
        const snapshot = await db.ref(ARTICLES_REF).once('value');
        const articlesObj = snapshot.val() || {};

        // Sort all articles once and store in cache
        const sorted = Object.values(articlesObj).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        _cacheData = { all: sorted, ts: now };

        if (category) {
            const lowerCat = category.toLowerCase();
            return sorted.filter((art) => (art.category || '').toLowerCase() === lowerCat);
        }

        return sorted;
    }

    /**
     * Get a single article by ID
     */
    static async getArticleById(id) {
        const snapshot = await db.ref(`${ARTICLES_REF}/${id}`).once('value');
        if (!snapshot.exists()) {
            return null;
        }
        return snapshot.val();
    }

    /**
     * Update an existing article
     */
    static async updateArticle(id, updates = {}) {
        const articleRef = db.ref(`${ARTICLES_REF}/${id}`);
        const snapshot = await articleRef.once('value');

        if (!snapshot.exists()) {
            return null;
        }

        const updatePayload = {
            ...updates,
            updatedAt: Date.now()
        };

        if (updates.category) {
            updatePayload.category = updates.category.toString().trim().toLowerCase();
        }

        await articleRef.update(updatePayload);
        invalidateCache();

        const updatedSnapshot = await articleRef.once('value');
        return updatedSnapshot.val();
    }

    /**
     * Delete an article
     */
    static async deleteArticle(id) {
        const articleRef = db.ref(`${ARTICLES_REF}/${id}`);
        const snapshot = await articleRef.once('value');

        if (!snapshot.exists()) {
            return false;
        }

        await articleRef.remove();
        invalidateCache();
        return true;
    }
}

module.exports = NewsModel;