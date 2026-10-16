const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function safeName(name) {
  return String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function generateToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Multer memory storage so we can place files in their destination pathPrefix
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

async function handleUpload(req, res) {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files || files.length === 0) {
    return res.status(400).json({ error: { code: 'bad-request', message: 'No files provided' } });
  }

  const rawPrefix = String(req.body.pathPrefix || req.query.pathPrefix || '').replace(/\\/g, '/');
  // Sanitize prefix to prevent directory traversal
  const sanitizedPrefix = rawPrefix.replace(/\.\./g, '').replace(/^\/+/, '');
  const prefix = sanitizedPrefix ? (sanitizedPrefix.endsWith('/') ? sanitizedPrefix : `${sanitizedPrefix}/`) : '';

  const uploaded = [];

  for (const file of files) {
    const filename = safeName(file.originalname);
    const storagePath = `${prefix}${Date.now()}-${generateToken()}-${filename}`;
    const targetFullPath = path.join(UPLOADS_DIR, storagePath);

    // Ensure directory exists
    const targetDir = path.dirname(targetFullPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetFullPath, file.buffer);

    // Build URL pointing to backend static server by default
    const host = `${req.protocol}://${req.get('host')}`;
    let url = `${host}/uploads/${storagePath}`;

    // Upload to Supabase Storage if configured
    try {
      const { isSupabaseConfigured, getSupabase } = require('../config/supabase');
      if (isSupabaseConfigured()) {
        const client = getSupabase({ requireServiceRole: true });
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'taskorbit-files';
        const { error: uploadError } = await client.storage
          .from(bucket)
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype || 'application/octet-stream',
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(storagePath);
          if (publicUrlData?.publicUrl) {
            url = publicUrlData.publicUrl;
          }
        } else {
          console.warn('[Supabase Storage] Upload warning:', uploadError.message);
        }
      }
    } catch (err) {
      console.warn('[Supabase Storage] Upload error:', err.message);
    }

    uploaded.push({
      name: file.originalname,
      storagePath,
      url,
      size: file.size,
      type: file.mimetype || 'application/octet-stream',
    });
  }

  return res.status(201).json({
    ok: true,
    files: uploaded,
    // If a single file was sent, also provide top-level convenient fields
    ...(uploaded.length === 1 ? uploaded[0] : {}),
  });
}

module.exports = {
  uploadMiddleware: upload.array('files', 10),
  singleUploadMiddleware: upload.single('file'),
  handleUpload,
  UPLOADS_DIR,
};
