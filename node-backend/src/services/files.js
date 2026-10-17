const { assert, text } = require('./common');
async function verifyFiles(input, user, kind, id) {
  assert(Array.isArray(input) && input.length > 0 && input.length <= 10, 'Attach between 1 and 10 files');
  const files = [];
  for (const item of input) {
    const storagePath = text(item.storagePath, 'Storage path', 1000, true);
    assert(!storagePath.includes('..'), 'Invalid file location');
    const size = Number(item.size);
    assert(Number.isFinite(size) && size > 0 && size <= 50 * 1024 * 1024, 'Invalid file size', 403);
    files.push({
      id: storagePath,
      name: text(item.name, 'File name', 255, true),
      storagePath,
      size,
      type: item.type || 'application/octet-stream',
      uploadedBy: user.uid,
      uploadedAt: new Date(),
      url: item.url || '',
    });
  }
  assert(new Set(files.map(f => f.storagePath)).size === files.length, 'Duplicate file');
  return files;
}
module.exports = { verifyFiles };
