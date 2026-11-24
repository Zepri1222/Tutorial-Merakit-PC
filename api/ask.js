export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const base = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!base || !key || !webhook) {
      console.error('Environment variable belum lengkap');
      return res.status(500).json({
        error: 'Konfigurasi server belum lengkap. Cek Environment Variables di Vercel.',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
    const cleanQuestion = String(body.question ?? '').trim();
    const cleanName = String(body.name ?? '').trim().slice(0, 60) || 'Pengunjung';
    const cleanCategory = String(body.category ?? '').trim().slice(0, 60) || 'Lainnya';
    const visitorToken = String(body.visitorToken ?? '').trim();

    if (!/^[a-zA-Z0-9-]{16,64}$/.test(visitorToken)) {
      return res.status(400).json({ error: 'Token pengunjung tidak valid. Muat ulang halaman.' });
    }

    if (cleanQuestion.length < 8 || cleanQuestion.length > 2000) {
      return res.status(400).json({ error: 'Pertanyaan harus 8-2000 karakter.' });
    }

    // 1. Simpan pertanyaan ke Supabase beserta token pengunjung
    const insertRes = await fetch(`${base}/rest/v1/pc_questions`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        name: cleanName,
        category: cleanCategory,
        question: cleanQuestion,
        visitor_token: visitorToken,
      }),
    });

    if (!insertRes.ok) {
      const detail = await insertRes.text();
      console.error('Supabase insert gagal:', insertRes.status, detail);
      return res.status(500).json({
        error: `Gagal menyimpan ke Supabase (kode ${insertRes.status}). Cek log Vercel.`,
      });
    }

    const [row] = await insertRes.json();

    // 2. Kirim notifikasi ke channel Discord (admin tetap melihat semua pertanyaan)
    const msgRes = await fetch(`${webhook}?wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content:
          `**Pertanyaan #${row.id}** dari ${cleanName} (${cleanCategory})\n` +
          `${cleanQuestion}\n\n` +
          `Balas dengan: \`/jawab id:${row.id} jawaban:...\``,
      }),
    });

    // 3. Simpan ID pesan Discord
    if (msgRes.ok) {
      const msg = await msgRes.json();
      await fetch(`${base}/rest/v1/pc_questions?id=eq.${row.id}`, {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discord_message_id: msg.id }),
      });
    } else {
      console.error('Discord webhook gagal:', msgRes.status, await msgRes.text());
    }

    return res.status(200).json({ ok: true, id: row.id });
  } catch (err) {
    console.error('ask.js error:', err);
    return res.status(500).json({ error: 'Server error. Cek log Vercel.' });
  }
}
