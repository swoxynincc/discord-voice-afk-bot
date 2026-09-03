const express = require('express');
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// 1. WEB SUNUCUSU (Render Kapanma Önleyici)
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('THEKANADA AFK BOT IS ALIVE WITH MODERATION COMANDOS!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Web sunucusu ${PORT} portunda aktif.`));

// 2. DISCORD BOT AYARLARI
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const BOT_TOKEN = process.env.DISCORD_TOKEN; 
const SES_KANAL_ID = "1543153290823475211"; 
const SUNUCU_ID = "1540484134361636884";
const PREFIX = '!';

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

// CHAT KOMUTLARI DİNLEYİCİSİ
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🔨 BAN KOMUTU
    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkin olmalı baba!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Kimi banlayacağımı etiketlemedin reis! Örn: `!ban @üye sebep`');
        if (!target.bannable) return message.reply('❌ Bu üye benden daha yüksek bir role sahip, onu uçuramam!');

        const reason = args.slice(1).join(' ') || 'Gerekçe belirtilmedi.';
        
        try {
            await target.ban({ reason: reason });
            message.reply(`🔨 **${target.user.tag}** sunucudan kalıcı olarak uçuruldu! \n**Gerekçe:** ${reason}`);
        } catch (err) {
            message.reply('❌ Banlama esnasında sistemsel bir hata çıktı.');
        }
    }

    // 🥾 KICK KOMUTU
    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri At` yetkin olmalı baba!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Kimi sunucudan atacağımı etiketlemedin reis! Örn: `!kick @üye sebep`');
        if (!target.kickable) return message.reply('❌ Bu üyenin rolü benden üstte, o yüzden sunucudan atamam!');

        const reason = args.slice(1).join(' ') || 'Gerekçe belirtilmedi.';

        try {
            await target.kick(reason);
            message.reply(`🥾 **${target.user.tag}** sunucudan tekmeleyerek atıldı! \n**Gerekçe:** ${reason}`);
        } catch (err) {
            message.reply('❌ Atma esnasında sistemsel bir hata çıktı.');
        }
    }

    // 🔓 UNBAN KOMUTU (ID ile)
    if (command === 'unban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkin olmalı baba!');
        }

        const userId = args[0];
        if (!userId) return message.reply('❌ Yasağını kaldıracağım üyenin ID\'sini yazmadın reis! Örn: `!unban 123456789012345678`');

        try {
            const bannedUsers = await message.guild.bans.fetch();
            const isBanned = bannedUsers.has(userId);

            if (!isBanned) return message.reply('❌ Belirttiğin ID\'ye sahip üye zaten banlı değil baba.');

            await message.guild.members.unban(userId);
            message.reply(`🔓 **<@${userId}>** idli üyenin yasağı başarıyla kaldırıldı!`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Yasak kaldırma esnasında bir hata oluştu. ID\'nin doğruluğundan emin ol.');
        }
    }

    // 🔇 MUTE KOMUTU (Mention ve Reply Destekli)
    if (command === 'mute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Zamanaşımına Uğrat` yetkin olmalı baba!');
        }

        let target = message.mentions.members.first();
        if (!target && message.reference) {
            try {
                const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
                target = await message.guild.members.fetch(repliedMsg.author.id).catch(() => null);
            } catch (e) {
                target = null;
            }
        }

        if (!target) return message.reply('❌ Kimi susturacağımı etiketlemedin veya bir mesaja yanıt vermedin reis!');
        if (!target.moderatable) return message.reply('❌ Bu üyeyi susturmaya gücüm yetmiyor, rolü benden üstte!');

        const duration = 10 * 60 * 1000; // 10 Dakika

        try {
            await target.timeout(duration, 'Komutla susturuldu.');
            message.reply(`🔇 **${target.user.tag}** başarıyla 10 dakika boyunca susturuldu!`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Susturma esnasında sistemsel bir hata çıktı.');
        }
    }

    // 🔊 UNMUTE KOMUTU (Mention ve Reply Destekli)
    if (command === 'unmute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Zamanaşımına Uğrat` yetkin olmalı baba!');
        }

        let target = message.mentions.members.first();
        if (!target && message.reference) {
            try {
                const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
                target = await message.guild.members.fetch(repliedMsg.author.id).catch(() => null);
            } catch (e) {
                target = null;
            }
        }

        if (!target) return message.reply('❌ Kimin susturmasını kaldıracağımı etiketlemedin veya yanıt vermedin reis!');
        if (!target.communicationDisabledUntilTimestamp) return message.reply('❌ Bu üye zaten susturulmamış baba.');

        try {
            await target.timeout(null, 'Susturulması kaldırıldı.');
            message.reply(`🔊 **${target.user.tag}** üyesinin susturulması kaldırıldı. Konuşabilir!`);
        } catch (err) {
            console.error(err);
            message.reply('❌ Susturma kaldırma esnasında sistemsel bir hata çıktı.');
        }
    }
});

client.login(BOT_TOKEN);
