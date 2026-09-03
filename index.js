const express = require('express');
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs'); // Uyarıları hafızada tutmak için dosya sistemi

// 1. ÖNCE WEB SUNUCUSUNU AÇIYORUZ (Render'ın hatasını kesin çözer)
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('THEKANADA AFK BOT IS ALIVE WITH FULL MODERATION COMANDOS!'));
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

// Uyarı sistemi hafıza dosyası ayarları
let uyarilar = {};
if (fs.existsSync('./uyarilar.json')) {
    try {
        uyarilar = JSON.parse(fs.readFileSync('./uyarilar.json', 'utf8'));
    } catch (err) {
        uyarilar = {};
    }
}
function uyariKaydet() {
    fs.writeFileSync('./uyarilar.json', JSON.stringify(uyarilar, null, 4));
}

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

    // Hem Etiket Hem Reply Destekleyen Yardımcı Fonksiyon
    async function getTargetMember() {
        let target = message.mentions.members.first();
        if (!target && message.reference) {
            const repliedMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
            if (repliedMsg) {
                target = await message.guild.members.fetch(repliedMsg.author.id).catch(() => null);
            }
        }
        return target;
    }

    // 🔨 BAN KOMUTU
    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkin olmalı baba!');
        }
        const target = await getTargetMember();
        if (!target) return message.reply('❌ Kimi banlayacağımı etiketlemedin veya yanıtlamadın reis!');
        if (!target.bannable) return message.reply('❌ Bu üyenin rolü benden üstte, onu uçuramam!');
        const reason = args.join(' ') || 'Gerekçe belirtilmedi.';
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
        const target = await getTargetMember();
        if (!target) return message.reply('❌ Kimi sunucudan atacağımı etiketlemedin veya yanıtlamadın reis!');
        if (!target.kickable) return message.reply('❌ Bu üyenin rolü benden üstte, o yüzden sunucudan atamam!');
        const reason = args.join(' ') || 'Gerekçe belirtilmedi.';
        try {
            await target.kick(reason);
            message.reply(`🥾 **${target.user.tag}** sunucudan tekmeleyerek atıldı! \n**Gerekçe:** ${reason}`);
        } catch (err) { message.reply('❌ Atma esnasında sistemsel bir hata çıktı.'); }
    }

    // 🔓 UNBAN KOMUTU (ID İle)
    if (command === 'unban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkin olmalı baba!');
        }
        const userId = args[0];
        if (!userId) return message.reply('❌ Yasağını kaldıracağım üyenin ID\'sini yazmadın reis! Örn: `!unban 123456789012345678`');
        try {
            const bannedUsers = await message.guild.bans.fetch();
            if (!bannedUsers.has(userId)) return message.reply('❌ Belirttiğin ID\'ye sahip üye zaten banlı değil baba.');
            await message.guild.members.unban(userId);
            message.reply(`🔓 **<@${userId}>** idli üyenin yasağı başarıyla kaldırıldı!`);
        } catch (err) { message.reply('❌ Yasak kaldırma esnasında bir hata oluştu. ID\'yi kontrol et.'); }
    }

    // 🔇 MUTE KOMUTU (Mention ve Reply Destekli)
    if (command === 'mute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Zamanaşımına Uğrat` yetkin olmalı baba!');
        }
        const target = await getTargetMember();
        if (!target) return message.reply('❌ Kimi susturacağımı etiketlemedin veya yanıtlamadın reis!');
        if (!target.moderatable) return message.reply('❌ Bu üyeyi susturmaya gücüm yetmiyor, rolü benden üstte!');
        try {
            await target.timeout(10 * 60 * 1000, 'Komutla susturuldu.');
            message.reply(`🔇 **${target.user.tag}** başarıyla 10 dakika boyunca susturuldu!`);
        } catch (err) { message.reply('❌ Susturma esnasında sistemsel bir hata çıktı.'); }
    }

    // 🔊 UNMUTE KOMUTU (Mention ve Reply Destekli)
    if (command === 'unmute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Bu komutu kullanmak için `Üyeleri Zamanaşımına Uğrat` yetkin olmalı baba!');
        }
        const target = await getTargetMember();
        if (!target) return message.reply('❌ Kimin susturmasını kaldıracağımı seçmedin reis!');
        if (!target.communicationDisabledUntilTimestamp) return message.reply('❌ Bu üye zaten susturulmamış baba.');
        try {
            await target.timeout(null, 'Susturulması kaldırıldı.');
            message.reply(`🔊 **${target.user.tag}** üyesinin susturulması kaldırıldı. Konuşabilir!`);
        } catch (err) { message.reply('❌ Susturma kaldırma esnasında sistemsel bir hata çıktı.'); }
    }

    // 🔒 JAIL (HAPİS) KOMUTU (Mention ve Reply Destekli)
    if (command === 'jail') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ Yetkin yok baba!');
        const target = await getTargetMember();
        if (!target) return message.reply('❌ Kimi karantinaya alacağımı seçmedin reis!');

        let jailRole = message.guild.roles.cache.find(r => r.name === 'Jailed');
        if (!jailRole) {
            try {
                jailRole = await message.guild.roles.create({
                    name: 'Jailed',
                    color: '#1a1a1a',
                    reason: 'Jail sistemi için otomatik oluşturuldu.'
                });
                message.guild.channels.cache.forEach(async (channel) => {
                    await channel.permissionOverwrites.edit(jailRole, {
                        SendMessages: false,
                        AddReactions: false,
                        Connect: false
                    }).catch(() => null);
                });
            } catch (err) { return message.reply('❌ Jail rolü oluşturulurken sistemsel hata çıktı.'); }
        }

        if (target.roles.cache.has(jailRole.id)) return message.reply('❌ Bu üye zaten hücrede baba.');

        try {
            await target.roles.add(jailRole);
            message.reply(`🔒 **${target.user.tag}** hücreye atıldı! Artık kanallara yazamaz.`);
        } catch { message.reply('❌ Rol verme esnasında hata çıktı. Bot rolde üstte olmalı.'); }
    }

    // 🔓 UNJAIL KOMUTU (Mention ve Reply Destekli)
    if (command === 'unjail') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ Yetkin yok baba!');
        const target = await getTargetMember();
        if (!target) return message.reply('❌ Kimi hapisten çıkaracağımı seçmedin reis!');

        let jailRole = message.guild.roles.cache.find(r => r.name === 'Jailed');
        if (!jailRole || !target.roles.cache.has(jailRole.id)) return message.reply('❌ Bu üye zaten hapiste değil baba.');

        try {
            await target.roles.remove(jailRole);
            message.reply(`🔓 **${target.user.tag}** hapisten çıkarıldı, özgürlüğüne kavuştu!`);
        } catch { message.reply('❌ Rol geri alınırken hata çıktı.'); }
    }

    // ⚠️ WARN (UYARI) KOMUTU (Mention ve Reply Destekli)
    if (command === 'warn') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply('❌ Yetkin yok baba!');
        const target = await getTargetMember();
        if (!target) return message.reply('❌ Kimi uyaracağımı seçmedin reis!');
        if (target.user.bot) return message.reply('❌ Botları uyaramazsın reis.');

        const reason = args.join(' ') || 'Sebep belirtilmedi.';
        if (!uyarilar[target.id]) uyarilar[target.id] = [];
        uyarilar[target.id].push({ reason, admin: message.author.tag, date: new Date().toLocaleDateString('tr-TR') });
        uyariKaydet();

