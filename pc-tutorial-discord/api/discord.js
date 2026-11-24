import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
export const config={api:{bodyParser:false}};
async function raw(req){const chunks=[];for await(const c of req)chunks.push(Buffer.isBuffer(c)?c:Buffer.from(c));return Buffer.concat(chunks);}
function valid(body,sig,ts,hex){try{const prefix=Buffer.from('302a300506032b6570032100','hex');const key=crypto.createPublicKey({key:Buffer.concat([prefix,Buffer.from(hex,'hex')]),format:'der',type:'spki'});return crypto.verify(null,Buffer.from(ts+body.toString('utf8')),key,Buffer.from(sig,'hex'));}catch{return false;}}
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).send('Method not allowed');const body=await raw(req),sig=req.headers['x-signature-ed25519'],ts=req.headers['x-signature-timestamp'];
 if(!sig||!ts||!valid(body,sig,ts,process.env.DISCORD_PUBLIC_KEY||''))return res.status(401).send('Invalid signature');
 let i;try{i=JSON.parse(body.toString('utf8'));}catch{return res.status(400).send('Invalid JSON');}
 if(i.type===1)return res.status(200).json({type:1});if(i.type!==2||i.data?.name!=='jawab')return res.status(200).json({type:4,data:{content:'Perintah tidak dikenal.',flags:64}});
 const uid=i.member?.user?.id||i.user?.id;if(!process.env.DISCORD_ADMIN_USER_ID||uid!==process.env.DISCORD_ADMIN_USER_ID)return res.status(200).json({type:4,data:{content:'Hanya admin yang diizinkan menjawab.',flags:64}});
 const opts=i.data.options||[],id=Number(opts.find(x=>x.name==='id')?.value),answer=String(opts.find(x=>x.name==='jawaban')?.value||'').trim();if(!Number.isSafeInteger(id)||id<1||answer.length<2||answer.length>1800)return res.status(200).json({type:4,data:{content:'ID atau jawaban tidak valid.',flags:64}});
 try{const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});const {data:q}=await db.from('pc_questions').select('id').eq('id',id).maybeSingle();if(!q)return res.status(200).json({type:4,data:{content:`Pertanyaan #${id} tidak ditemukan.`,flags:64}});const {error}=await db.from('pc_questions').update({answer,status:'answered',answered_at:new Date().toISOString(),answered_by_discord:uid}).eq('id',id);if(error)throw error;return res.status(200).json({type:4,data:{content:`Berhasil! Jawaban untuk pertanyaan #${id} sudah tampil di website.`,flags:64}});}catch(e){console.error(e);return res.status(200).json({type:4,data:{content:'Gagal menyimpan jawaban. Periksa log Vercel.',flags:64}});}
}
