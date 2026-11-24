export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = String(req.headers['x-visitor-token'] || '');
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(token)) {
    return res.status(200).json({ items: [] });
  }

  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) {
    return res.status(500).json({ error: 'Konfigurasi server belum lengkap.' });
  }

  try {
    const url =
      `${base}/rest/v1/pc_questions` +
      `?select=id,name,category,question,answer,status,created_at` +
      `&visitor_token=eq.${encodeURIComponent(token)}` +
      `&order=created_at.desc`;

    const r = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    if (!r.ok) {
      console.error('Supabase answers gagal:', r.status, await r.text());
      return res.status(500).json({ error: 'Gagal memuat jawaban.' });
    }

    const items = await r.json();
    return res.status(200).json({ items });
  } catch (err) {
    console.error('answers.js error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
