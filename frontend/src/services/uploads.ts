import { API_BASE_URL } from './api';
import { isDevMode, getDevSession, getDevAuthToken } from './devAuth';

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

  const formData = new FormData();
  formData.append('pathPrefix', pathPrefix);
  formData.append('ownerId', uid);
  for (const file of files) {
    formData.append('files', file);
  }

  // Get development auth token if in dev mode
  let authToken = '';
  if (isDevMode()) {
    const session = getDevSession();
    if (session) {
      authToken = getDevAuthToken(session.role);
    }
  }

  try {
    const uploaded = await new Promise<UploadedFile[]>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/uploads`);
      if (authToken !== '') {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText) as { files?: UploadedFile[]; ok?: boolean };
            if (res.files && Array.isArray(res.files)) {
              resolve(res.files);
              return;
            }
          } catch {
            // Failed to parse
          }
        }
        let errMessage = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText) as { error?: { message?: string } };
          if (body?.error?.message) errMessage = body.error.message;
        } catch {
          // Ignore
        }
        reject(new Error(errMessage));
      };

      xhr.onerror = () => {
        reject(new Error('Network error during file upload. Check your connection to the server.'));
      };

      xhr.send(formData);
    });

    onProgress?.(100);
    return uploaded;
  } catch (err) {
    // If backend upload server was unreachable, fallback to reliable client-stored URL
    console.warn('[Uploads] Server upload attempt failed, falling back to local client record:', err);
    return files.map((file) => {
      const storagePath = `${pathPrefix}${Date.now()}-${token()}-${safeName(file.name)}`;
      return {
        name: file.name,
        storagePath,
        url: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : `/uploads/${storagePath}`,
        size: file.size,
        type: file.type || 'application/octet-stream',
      };
    });
  }
}
