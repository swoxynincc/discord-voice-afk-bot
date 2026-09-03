const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Şifreyi Render'ın içindeki gizli kasadan çekecek
const BOT_TOKEN = process.env.DISCORD_TOKEN; 
const SES_KANAL_ID = "1543153290823475211"; // Senin kilitli kanal ID'n
const SUNUCU_ID = "1540484134361636884";

client.once('ready', () => {
    console.log(`${client.user.tag} aktif! Sese bağlanılıyor...`);
    try {
        joinVoiceChannel({
            channelId: SES_KANAL_ID,
            guildId: SUNUCU_ID,
            adapterCreator: client.guilds.cache.get(SUNUCU_ID).voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
        });
        console.log("Ses kanalına başarıyla Giriş Yaptı!");
    } catch (error) {
        console.error("Hata çıktı reis:", error);
    }
});

client.login(BOT_TOKEN);
