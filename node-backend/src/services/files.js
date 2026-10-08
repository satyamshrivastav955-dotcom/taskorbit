const {getAdmin,db} = require('../config/firebase');
const {assert,text} = require('./common');
async function verifyFiles(input,user,kind,id) {
  assert(Array.isArray(input) && input.length > 0 && input.length <= 10,'Attach between 1 and 10 files');
  let prefix;
  if (kind === 'submission') { const t = await db().collection('tasks').doc(id).get(); assert(t.exists && t.data().assigneeId === user.uid,'Not your task',403); prefix = 'projects/'+t.data().projectId+'/submissions/'+id+'/'; }
  else prefix = 'projects/'+id+'/requirements/';
  const bucket = getAdmin().storage().bucket(); const files = [];
  for (const item of input) {
    const storagePath = text(item.storagePath,'Storage path',1000,true);
    assert(storagePath.startsWith(prefix) && !storagePath.includes('..'),'Invalid file location');
    let meta; try { [meta] = await bucket.file(storagePath).getMetadata(); } catch { assert(false,'Uploaded file was not found'); }
    assert(meta.metadata?.ownerId === user.uid && Number(meta.size)>0 && Number(meta.size)<=50*1024*1024,'Invalid file owner or size',403);
    const token = meta.metadata?.firebaseStorageDownloadTokens?.split(',')[0]; assert(token,'File has no download token');
    const host = process.env.FIREBASE_STORAGE_EMULATOR_HOST ? 'http://'+process.env.FIREBASE_STORAGE_EMULATOR_HOST : 'https://firebasestorage.googleapis.com';
    files.push({id:storagePath,name:text(item.name,'File name',255,true),storagePath,size:Number(meta.size),type:meta.contentType||'application/octet-stream',uploadedBy:user.uid,uploadedAt:new Date(),url:host+'/v0/b/'+bucket.name+'/o/'+encodeURIComponent(storagePath)+'?alt=media&token='+token});
  }
  assert(new Set(files.map(f=>f.storagePath)).size===files.length,'Duplicate file'); return files;
}
module.exports = {verifyFiles};
