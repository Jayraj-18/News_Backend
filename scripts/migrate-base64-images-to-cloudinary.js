require('dotenv').config();

const { db } = require('../config/firebase');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dpmipvmgg';
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'palghar_preset';
const APPLY = process.argv.includes('--apply');

const isBase64Image = (url) => typeof url === 'string' && url.startsWith('data:image/');

const uploadToCloudinary = async (dataUri, publicId) => {
  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'palghar-drushti/articles');
  formData.append('public_id', publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || `Cloudinary upload failed (${response.status})`);
  }

  return result.secure_url;
};

const migrate = async () => {
  const snapshot = await db.ref('articles').once('value');
  const articles = snapshot.val() || {};
  const candidates = Object.entries(articles).filter(([, article]) =>
    isBase64Image(article.featuredImage?.url)
  );

  console.log(`Found ${candidates.length} base64 featured images.`);
  if (!APPLY) {
    console.log('Dry run only. Re-run with --apply to upload and update Firebase.');
    return;
  }

  let migrated = 0;
  for (const [id, article] of candidates) {
    const originalDataUri = article.featuredImage.url;
    console.log(`Uploading ${id} (${migrated + 1}/${candidates.length})...`);

    const cloudinaryUrl = await uploadToCloudinary(
      originalDataUri,
      `article-${id}-featured`
    );

    await db.ref(`articles/${id}/featuredImage`).update({
      url: cloudinaryUrl,
      originalUrl: cloudinaryUrl
    });

    migrated += 1;
  }

  console.log(`Migrated ${migrated} images to Cloudinary.`);
};

migrate()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  });
