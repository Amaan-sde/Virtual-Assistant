const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary using environment variables. dotenv should be loaded before requiring this module.
function ensureCloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_URL } = process.env;
  if (CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: CLOUDINARY_URL });
    return;
  }
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary configuration. Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set in environment.');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

exports.uploadOnCloudinary = async (filePath) => {
  // Ensure config on each call to be robust to require ordering.
  ensureCloudinaryConfig();

  try {
    const result = await cloudinary.uploader.upload(filePath);
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore unlink errors */ }
    console.log('Cloudinary upload result:', result);
    return result.secure_url;
  } catch (error) {
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    console.error('Cloudinary upload failed:', error);
    // Throw the error so the caller (controller) can handle the HTTP response.
    throw error;
  }
};
