import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadedFile {
  name: string;
  storagePath: string;
  url: string;
  size: number;
  type: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function token(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function uploadFiles(
  files: File[],
  uid: string,
  pathPrefix: string,
  onProgress?: (percent: number) => void,
): Promise<UploadedFile[]> {
  if (files.length === 0) return [];
  if (files.length > 10) throw new Error('Attach no more than 10 files.');
  for (const file of files) {
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name} must be between 1 byte and 50 MB.`);
    }
  }
  const uploaded: UploadedFile[] = [];
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  let completedBytes = 0;
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const storagePath = `${pathPrefix}${Date.now()}-${token()}-${safeName(file.name)}`;
    const storageRef = ref(storage, storagePath);
    const upload = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        ownerId: uid,
        firebaseStorageDownloadTokens: token(),
      },
    });
    await new Promise<void>((resolve, reject) => {
      upload.on('state_changed', (snapshot) => {
        onProgress?.(Math.round(((completedBytes + snapshot.bytesTransferred) / totalBytes) * 100));
      }, reject, resolve);
    });
    completedBytes += file.size;
    uploaded.push({
      name: file.name,
      storagePath,
      url: await getDownloadURL(storageRef),
      size: file.size,
      type: file.type || 'application/octet-stream',
    });
    onProgress?.(Math.round((completedBytes / totalBytes) * 100));
  }
  return uploaded;
}
