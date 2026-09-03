const express = require('express');
const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// 1. ÖNCE WEB SUNUCUSUNU AÇIYORUZ (Render Kapanma Önleyici)
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
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const BOT_TOKEN = process.env.DISCORD_TOKEN; 
const SES_KANAL_ID = "1543153290823475211"; 
const SUNUCU_ID = "1540484134361636884";
const PREFIX = '!';
const HOS_GELDIN_KANAL_ID = "1543524294318096384"; 
const SUSP_ROL_ID = "1545092036695429191"; // 🌟 Belirttiğin tehlikeli üye rolü

// 🌟 AKILLI EMBEDLİ HOŞ GELDİN SİSTEMİ
client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== SUNUCU_ID) return;
    
    const kanal = member.guild.channels.cache.get(HOS_GELDIN_KANAL_ID);
    if (!kanal) return;

    // Hesap oluşturma tarihi hesaplamaları
    const kurulusMilisaniye = member.user.createdTimestamp;
    const simdikiZaman = Date.now();
    const besAyMilisaniye = 5 * 30.4 * 24 * 60 * 60 * 1000; // 5 aylık ortalama süre
    
    const hesapYasiMilisaniye = simdikiZaman - kurulusMilisaniye;
    const kurulusTarihi = new Date(kurulusMilisaniye).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    // Discord formatında dinamik zaman kodu (Örn: 2 yıl önce oluşturuldu)
    const discordZamanFormati = `<t:${Math.floor(kurulusMilisaniye / 1000)}:R>`;

    // Embed Mesajı İnşa Ediliyor
    const embed = new EmbedBuilder()
        .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`${member} has joined THEKANADA, I dont know who invited them.`)
        .addFields({ name: '📅 Hesap Kuruluş Tarihi', value: `\`${kurulusTarihi}\` (${discordZamanFormati})`, inline: false })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    // 5 Aydan Yeni mi Eski mi Kontrolü
    if (hesapYasiMilisaniye < besAyMilisaniye) {
        // 🚨 HESAP TEHLİKELİ (5 Aydan Yeni)
        embed.setTitle('🚨 Şüpheli Hesap Girişi!')
             .setColor('#ff0000') // Kırmızı Renk
             .addFields({ name: '🛡️ Güvenlik Durumu', value: '❌ **Tehlikeli Üye!** (Hesap 5 aydan daha yeni)', inline: false });
        
        // Tehlikeli üyeye otomatik olarak rolü veriyoruz
        await member.roles.add(SUSP_ROL_ID).catch(err => console.error("Rol verme hatası:", err));
    } else {
        // ✅ HESAP GÜVENLİ (5 Aydan Eski)
        embed.setTitle('✅ Yeni Üye Katıldı!')
             .setColor('#00ff00') // Yeşil Renk
             .addFields({ name: '🛡️ Güvenlik Durumu', value: '🛡️ **Güvenilir Üye** (Hesap 5 aydan daha eski)', inline: false });
    }

    kanal.send({ embeds: [embed] }).catch(err => console.error("Embed gönderme hatası:", err));
});

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
    if (message.author.bot) return;

    // OTOMATİK SELAMLA SİSTEMİ
    const mesajIcerik = message.content.toLowerCase().trim();
    if (mesajIcerik === 'sa' || mesajIcerik === 'saü' || mesajIcerik === 'selamun aleykum' || mesajIcerik === 'selamın aleyküm' || mesajIcerik === 'selamün aleyküm') {
        return message.reply('Aleykum selam durum cekip bizden olabilirsin');
    }

    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 📜 HELP KOMUTU
    if (command === 'help' || command === 'yardım') {
        const helpText = 
            `📜 **THEKANADA BOT - TÜM KOMUTLAR VE KULLANIM REHBERİ**\n\n` +
            `🔨 **${PREFIX}ban <@üye> [sebep]**\n` +
            `└ **Açıklama:** Belirtilen üyeyi sunucudan kalıcı olarak yasaklar.\n\n` +
            `🥾 **${PREFIX}kick <@üye> [sebep]**\n` +
            `└ **Açıklama:** Belirtilen üyeyi sunucudan atar.\n\n` +
            `🔓 **${PREFIX}unban <Kullanıcı-ID>**\n` +
            `└ **Açıklama:** Banı olan bir üyenin yasağını ID ile kaldırır.\n\n` +
            `🔇 **${PREFIX}mute <@üye>**\n` +
            `└ **Açıklama:** Üyeyi 10 dakika boyunca susturur (Reply/Mention).\n\n` +
            `🔊 **${PREFIX}unmute <@üye>**\n` +
            `└ **Açıklama:** Susturulan üyenin cezasını anında kaldırır (Reply/Mention).`;

        return message.reply(helpText);
    }

    // 🔨 BAN KOMUTU
    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkin olmalı baba!');
        }
        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Kimi banlayacağımı etiketlemedin reis!');
        if (!target.bannable) return message.reply('❌ Bu üye benden daha yüksek bir role sahip, uçuramam!');
        const reason = args.slice(1).join(' ') || 'Gerekçe belirtilmedi.';
        try {
            await target.ban({ reason: reason });
            message.reply(`🔨 **${target.user.tag}** sunucudan kalıcı olarak uçuruldu! \n**Gerekçe:** ${reason}`);
        } catch (err) { message.reply('❌ Banlama esnasında sistemsel bir hata çıktı.'); }
    }

    // 🥾 KICK KOMUTU
    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri At` yetkin olmalı baba!');
        }
        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Kimi sunucudan atacağımı etiketlemedin reis!');
        if (!target.kickable) return message.reply('❌ Bu üyenin rolü benden üstte, atamam!');
        const reason = args.slice(1).join(' ') || 'Gerekçe belirtilmedi.';
        try {
            await target.kick(reason);
            message.reply(`🥾 **${target.user.tag}** sunucudan tekmeleyerek atıldı! \n**Gerekçe:** ${reason}`);
        } catch (err) { message.reply('❌ Atma esnasında sistemsel bir hata çıktı.'); }
    }

    // 🔓 UNBAN KOMUTU
    if (command === 'unban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkin olmalı baba!');
        }
        const userId = args[0];
        if (!userId) return message.reply('❌ Yasağını kaldıracağım üyenin ID\'sini yazmadın reis!');
        try {
            const bannedUsers = await message.guild.bans.fetch();
            if (!bannedUsers.has(userId)) return message.reply('❌ Belirttiğin ID\'ye sahip üye zaten banlı değil baba.');
            await message.guild.members.unban(userId);
            message.reply(`🔓 **<@${userId}>** idli üyenin yasağı başarıyla kaldırıldı!`);
        } catch (err) { message.reply('❌ Yasak kaldırma esnasında bir hata oluştu.'); }
    }

    // 🔇 MUTE KOMUTU
    if (command === 'mute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Zamanaşımına Uğrat` yetkin olmalı baba!');
        }
        let target = message.mentions.members.first();
        if (!target && message.reference) {
            try {
                const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
                if (repliedMsg.author.id === client.user.id) {
                    target = repliedMsg.mentions.members.first();
                } else {
                    target = await message.guild.members.fetch(repliedMsg.author.id).catch(() => null);
                }
            } catch (e) { target = null; }
        }
        if (!target) return message.reply('❌ Kimi susturacağımı seçmedin reis!');
        if (!target.moderatable) return message.reply('❌ Bu üyeyi susturmaya gücüm yetmiyor!');
        try {
            await target.timeout(10 * 60 * 1000, 'Komutla susturuldu.');
            message.reply(`🔇 ${target} başarıyla 10 dakika boyunca susturuldu!`);
        } catch (err) { message.reply('❌ Susturma esnasında sistemsel bir hata çıktı.'); }
    }

    // 🔊 UNMUTE KOMUTU
    if (command === 'unmute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Zamanaşımına Uğrat` yetkin olmalı baba!');
        }
        let target = message.mentions.members.first();
        if (!target && message.reference) {
            try {
                const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
                if (repliedMsg.author.id === client.user.id) {
                    target = repliedMsg.mentions.members.first();
                } else {
                    target = await message.guild.members.fetch(repliedMsg.author.id).catch(() => null);
                }
            } catch (e) { target = null; }
        }
        if (!target) return message.reply('❌ Kimin susturmasını kaldıracağımı seçmedin reis!');
