export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, category, question } = req.body ?? {};
  const cleanQuestion = String(question ?? '').trim();
  const cleanName = String(name ?? 'Pengunjung').trim().slice(0, 60) || 'Pengunjung';
  const cleanCategory = String(category ?? 'Lainnya').trim().slice(0, 60) || 'Lainnya';

  if (cleanQuestion.length < 8 || cleanQuestion.length > 2000) {
    return res.status(400).json({ error: 'Pertanyaan harus 8-2000 karakter.' });
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const base = process.env.SUPABASE_URL;

  const insertRes = await fetch(`${base}/rest/v1/pc_questions`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ name: cleanName, category: cleanCategory, question: cleanQuestion }),
  });

  if (!insertRes.ok) {
    return res.status(500).json({ error: 'Gagal menyimpan pertanyaan.' });
  }

  const [row] = await insertRes.json();

  const msgRes = await fetch(`${process.env.DISCORD_WEBHOOK_URL}?wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content:
        `**Pertanyaan #${row.id}** dari ${cleanName} (${cleanCategory})\n` +
        `${cleanQuestion}\n\n` +
        `Balas dengan: \`/jawab id:${row.id} jawaban:...\``,
    }),
  });

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
  }

  return res.status(200).json({ ok: true, id: row.id });
}
