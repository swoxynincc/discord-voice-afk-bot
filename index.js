const express = require('express');
const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => { res.send('THEKANADA AFK BOT IS ALIVE WITH MODERATION COMANDOS!'); });
app.listen(PORT, '0.0.0.0', () => { console.log('Web sunucusu aktif.'); });

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
const SUSP_ROL_ID = "1545092036695429191"; 

const afkMekanizmasi = new Map();

client.on('guildMemberAdd', async (member) => {
    if (member.guild.id !== SUNUCU_ID) return;
    try {
        const kanal = await member.guild.channels.fetch(HOS_GELDIN_KANAL_ID).catch(() => null);
        if (!kanal) return;

        const kurulusMilisaniye = member.user.createdTimestamp;
        const simdikiZaman = Date.now();
        const besAyMilisaniye = 5 * 30.4 * 24 * 60 * 60 * 1000; 
        const hesapYasiMilisaniye = simdikiZaman - kurulusMilisaniye;
        const kurulusTarihi = new Date(kurulusMilisaniye).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        const discordZamanFormati = `<t:${Math.floor(kurulusMilisaniye / 1000)}:R>`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`${member} has joined THEKANADA, I dont know who invited them.`)
            .addFields({ name: '📅 Hesap Kuruluş Tarihi', value: `\`${kurulusTarihi}\` (${discordZamanFormati})`, inline: false })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        if (hesapYasiMilisaniye < besAyMilisaniye) {
            embed.setTitle('🚨 Şüpheli Hesap Girişi!')
                 .setColor('#ff0000') 
                 .addFields({ name: '🛡️ Güvenlik Durumu', value: '❌ **Tehlikeli Üye!** (Hesap 5 aydan daha yeni)', inline: false });
            await member.roles.add(SUSP_ROL_ID).catch(() => null);
        } else {
            embed.setTitle('✅ Yeni Üye Katıldı!')
                 .setColor('#00ff00') 
                 .addFields({ name: '🛡️ Güvenlik Durumu', value: '🛡️ **Güvenilir Üye** (Hesap 5 aydan daha eski)', inline: false });
        }
        await kanal.send({ embeds: [embed] }).catch(() => null);
    } catch (error) {
        console.error(error);
    }
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
        console.error("Hata çıktı:", error);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (afkMekanizmasi.has(message.author.id)) {
        afkMekanizmasi.delete(message.author.id);
        message.reply('AFK Durumunu Sildim Reis!').then(msg => {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }).catch(() => null);
        return;
    }

    if (message.mentions.members.size > 0) {
        message.mentions.members.forEach((mentionMember) => {
            if (afkMekanizmasi.has(mentionMember.id)) {
                const afkBilgisi = afkMekanizmasi.get(mentionMember.id);
                message.reply(`⚠️ **${mentionMember.user.username}** Şuandan itibaren **${afkBilgisi.sebep}** ile AFK!`).catch(() => null);
            }
        });
    }

    const mesajIcerik = message.content.toLowerCase().trim();
    const selamlar = ['sa', 'saü', 'selamun aleykum', 'selamın aleyküm', 'selamün aleyküm'];
    if (selamlar.includes(mesajIcerik)) {
        return message.reply('Aleykum selam durum cekip bizden olabilirsin');
    }

    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'afk') {
        const sebep = args.join(' ') || 'Sebep belirtilmedi';
        afkMekanizmasi.set(message.author.id, { sebep: sebep, zaman: Date.now() });
        return message.reply(`💤 Başarıyla AFK moduna geçtin reis. Gerekçe: **${sebep}**`);
    }

    if (command === 'help' || command === 'yardım') {
        const helpText = `📜 **THEKANADA BOT - TÜM KOMUTLAR**\n\n💤 **${PREFIX}afk [sebep]**\n└ Sizi AFK moduna alır.\n\n🔨 **${PREFIX}ban <@üye>**\n└ Üyeyi kalıcı yasaklar.\n\n🥾 **${PREFIX}kick <@üye>**\n└ Üyeyi sunucudan atar.\n\n🔓 **${PREFIX}unban <ID>**\n└ Üyenin banını kaldırır.\n\n🔇 **${PREFIX}mute <@üye>**\n└ Üyeyi 10 dakika susturur (Reply/Mention).\n\n🔊 **${PREFIX}unmute <@üye>**\n└ Susturmayı kaldırır (Reply/Mention).`;
        return message.reply(helpText);
    }

    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Bu komutu kullanmak için yetkin olmalı baba!');
        }
        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Kimi banlayacağımı etiketlemedin reis!');
        if (!target.bannable) return message.reply('❌ Bu üyenin rolü benden üstte!');
        const reason = args.slice(1).join(' ') || 'Gerekçe belirtilmedi.';
        try {
            await target.ban({ reason: reason });
            message.reply(`🔨 **${target.user.tag}** sunucudan uçuruldu! \n**Gerekçe:** ${reason}`);
        } catch (err) { message.reply('❌ Banlama esnasında hata çıktı.'); }
    }

    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ Bu komutu kullanmak için yetkin olmalı baba!');
        }
        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ Kimi sunucudan atacağımı etiketlemedin reis!');
        if (!target.kickable) return message.reply('❌ Bu üyenin rolü benden üstte!');
        const reason = args.slice(1).join(' ') || 'Gerekçe belirtilmedi.';
        try {
            await target.kick(reason);
            message.reply(`🥾 **${target.user.tag}** sunucudan atıldı! \n**Gerekçe:** ${reason}`);
        } catch (err) { message.reply('❌ Atma esnasında hata çıktı.'); }
    }

    if (command === 'unban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ Bu komutu kullanmak için yetkin olmalı baba!');
        }
        const userId = args;
        if (!userId) return message.reply('❌ Yasağını kaldıracağım üyenin ID\'sini yazmadın reis!');
        try {
            const bannedUsers = await message.guild.bans.fetch();
            if (!bannedUsers.has(userId)) return message.reply('❌ Belirttiğin ID zaten banlı değil baba.');
            await message.guild.members.unban(userId);
            message.reply(`🔓 **<@${userId}>** idli üyenin yasağı kaldırıldı!`);
        } catch (err) { message.reply('❌ Yasak kaldırma esnasında hata oluştu.'); }
    }

    if (command === 'mute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Bu komutu kullanmak için yetkin olmalı baba!');
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
        } catch (err) { message.reply('❌ Susturma esnasında hata çıktı.'); }
    }

    if (command === 'unmute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply('❌ Bu komutu kullanmak için yetkin olmalı baba!');
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
        if (!target.communicationDisabledUntilTimestamp) return message.reply('❌ Bu üye zaten susturulmamış baba.');
        try {
            await target.timeout(null, 'Susturulması kaldırıldı.');
message.reply(🔊 ${target} üyesinin susturulması kaldırıldı. Konuşabilir!);
        } catch (err) { message.reply('❌ Susturma kaldırma esnasında hata çıktı.'); }
    }
});
client.login(BOT_TOKEN);
