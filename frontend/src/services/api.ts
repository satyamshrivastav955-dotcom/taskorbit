import { auth } from './firebase';

const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000/api';

async function headers(): Promise<HeadersInit> {
  const user = auth.currentUser;
  const token = user !== null ? await user.getIdToken() : '';
  return { 'Content-Type': 'application/json', ...(token !== '' ? { Authorization: `Bearer ${token}` } : {}) };
}

async function handle(res: Response, mutated = false): Promise<unknown> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: { code: 'unknown', message: res.statusText } }))) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? `Request failed (${res.status})`);
  }
  if (mutated && typeof window !== 'undefined') window.dispatchEvent(new Event('taskorbit:mutated'));
  return res.json() as Promise<unknown>;
}

export async function apiPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${base}${path}`, { method: 'POST', headers: await headers(), body: JSON.stringify(body) });
  return handle(res, true);
}

export async function apiPut(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${base}${path}`, { method: 'PUT', headers: await headers(), body: JSON.stringify(body) });
  return handle(res, true);
}

export async function apiPatch(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${base}${path}`, { method: 'PATCH', headers: await headers(), body: JSON.stringify(body) });
  return handle(res, true);
}

export async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(`${base}${path}`, { headers: await headers() });
  return handle(res);
}

export async function apiDelete(path: string): Promise<unknown> {
  const res = await fetch(`${base}${path}`, { method: 'DELETE', headers: await headers() });
  return handle(res, true);
}
