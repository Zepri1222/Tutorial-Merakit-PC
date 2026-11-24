# Tutorial Merakit PC — Q&A Discord

## 1. Supabase
Jalankan `schema.sql` di Supabase > SQL Editor. Dari Project Settings > API, catat Project URL dan service_role secret. Service-role hanya dimasukkan ke Vercel Environment Variables, jangan ke HTML/GitHub.

## 2. Discord
- Buat aplikasi di https://discord.com/developers/applications.
- General Information: salin Application ID dan Public Key.
- Bot: buat/reset Bot Token. Jangan bagikan token.
- Tambahkan aplikasi ke server dengan scope `applications.commands`.
- Buat webhook di channel pertanyaan (Edit Channel > Integrations > Webhooks) dan salin URL.
- Aktifkan Developer Mode, klik kanan akun admin > Copy User ID; ini `DISCORD_ADMIN_USER_ID`.
- Klik kanan server > Copy Server ID; ini `DISCORD_GUILD_ID`.

## 3. GitHub + Vercel
Upload seluruh isi folder ini ke repository GitHub (jangan upload `.env`). Import repository di Vercel dengan preset Other. Tambahkan Environment Variables:
- `SUPABASE_URL` = URL project Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = service_role secret Supabase
- `DISCORD_WEBHOOK_URL` = webhook URL channel Discord
- `DISCORD_PUBLIC_KEY` = Public Key Discord Application
- `DISCORD_ADMIN_USER_ID` = Discord User ID admin
Deploy ulang setelah menyimpan variables.

## 4. Daftarkan slash command /jawab
Di komputer, buka folder project dan jalankan `npm install`. Salin `.env.example` menjadi `.env`, lalu isi `DISCORD_APP_ID`, `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`. Jalankan `npm run register-command`. File `.env` jangan diunggah ke GitHub.

## 5. Hubungkan Discord ke endpoint Vercel
Di Discord Developer Portal > aplikasi > General Information, isi Interactions Endpoint URL dengan `https://ALAMAT-VERCEL-KAMU/api/discord`. Discord akan menguji endpoint. Simpan jika valid.

## 6. Tes
Kirim pertanyaan dari website. Pertanyaan masuk ke channel Discord. Jalankan `/jawab`, isi `id` sesuai nomor pertanyaan dan `jawaban` dengan jawabanmu. Refresh website; jawaban tampil di bagian Jawaban admin.

Catatan: endpoint hanya menerima perintah dari Discord User ID yang ada di `DISCORD_ADMIN_USER_ID`. Jangan pernah memasukkan Bot Token, Webhook URL, atau service_role ke HTML publik.
