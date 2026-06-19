import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStore } from '@netlify/blobs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultItinerary = JSON.parse(
  readFileSync(join(__dirname, '../../data/default-itinerary.json'), 'utf8')
);

const STORE_NAME = 'scotland-trip';
const BLOB_KEY = 'itinerary';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Edit-Key'
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function withTimestamp(data) {
  return {
    version: data.version ?? 1,
    updatedAt: new Date().toISOString(),
    events: data.events ?? []
  };
}

function isAuthorized(req) {
  const editKey = process.env.EDIT_KEY;
  if (!editKey) return true;
  return req.headers.get('x-edit-key') === editKey;
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const store = getStore(STORE_NAME);

  if (req.method === 'GET') {
    const stored = await store.get(BLOB_KEY, { type: 'json' });
    if (stored?.events?.length) {
      return jsonResponse({ ...stored, editRequired: !!process.env.EDIT_KEY });
    }
    return jsonResponse({ ...withTimestamp(defaultItinerary), editRequired: !!process.env.EDIT_KEY });
  }

  if (req.method === 'PUT') {
    if (!isAuthorized(req)) {
      return jsonResponse({ error: 'Unauthorized — check your edit key' }, 401);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    if (!Array.isArray(body.events)) {
      return jsonResponse({ error: 'Body must include an events array' }, 400);
    }

    const payload = withTimestamp(body);
    await store.setJSON(BLOB_KEY, payload);
    return jsonResponse({ ok: true, updatedAt: payload.updatedAt });
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
};
