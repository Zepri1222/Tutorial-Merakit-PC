import 'dotenv/config';
const {DISCORD_APP_ID,DISCORD_BOT_TOKEN,DISCORD_GUILD_ID}=process.env;
if(!DISCORD_APP_ID||!DISCORD_BOT_TOKEN||!DISCORD_GUILD_ID)throw new Error('Isi DISCORD_APP_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID di .env');
const command={name:'jawab',description:'Jawab pertanyaan pengunjung website',options:[{name:'id',description:'Nomor pertanyaan website',type:3,required:true},{name:'jawaban',description:'Jawaban untuk pengunjung',type:3,required:true}]};
const r=await fetch(`https://discord.com/api/v10/applications/${DISCORD_APP_ID}/guilds/${DISCORD_GUILD_ID}/commands`,{method:'POST',headers:{Authorization:`Bot ${DISCORD_BOT_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(command)});const data=await r.json();if(!r.ok){console.error(data);process.exit(1);}console.log('Command /jawab berhasil dibuat:',data.name);
