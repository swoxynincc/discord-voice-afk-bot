const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ActivityType
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

// ================================
// BELLEKLER
// ================================

const levelXP = new Map();
const levelNum = new Map();
const uyarilar = new Map();
const afkKullanicilar = new Map();

const aktifAdamAsmaca = new Map();
const aktifFastKelime = new Map();

const fastKelimeHavuzu = [
    'kanada',
    'vancouver',
    'toronto',
    'ottawa',
    'ekonomi',
    'dolar',
    'akçaağaç',
    'gurbet',
    'yazılım',
    'discord'
];

// ================================
// WEB SUNUCUSU
// ================================

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Zaafsız Bot Aktif!');
});

app.listen(PORT, () => {
    console.log('Web sunucusu basariyla baslatildi.');
});

// ================================
// BOT HAZIR
// ================================

client.on('ready', () => {
    console.log('Zaafsız Bot aktif!');

    client.user.setPresence({
        activities: [
            {
                name: 'Developed By Swoxyn',
                type: ActivityType.Playing
            }
        ],
        status: 'online'
    });

    const channelId = '1543153290823475211';
    const guildId = '1540484134361636884';

    const connectToVoice = () => {
        try {
            const guild = client.guilds.cache.get(guildId);

            if (!guild) return;

            joinVoiceChannel({
                channelId: channelId,
                guildId: guildId,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: true
            });
        } catch (error) {
            console.log('Ses kanalina baglanilamadi.');
        }
    };

    connectToVoice();

    setInterval(() => {
        connectToVoice();
    }, 15 * 60 * 1000);
});

// ================================
// MESAJ SİSTEMİ
// ================================

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    // ================================
    // AFK KONTROL
    // ================================

    if (afkKullanicilar.has(userId)) {
        afkKullanicilar.delete(userId);

        message.reply('👋 Hoş geldin! AFK durumunu temizledim.');
    }

    message.mentions.users.forEach((user) => {
        if (afkKullanicilar.has(user.id)) {
            const sebep = afkKullanicilar.get(user.id);

            message.reply(
                '💤 **' +
                user.username +
                '** şu an AFK! Sebep: `' +
                sebep +
                '`'
            );
        }
    });

    // ================================
    // SEVİYE SİSTEMİ
    // ================================

    if (!message.content.startsWith('!')) {
        let xp = levelXP.get(userId) || 0;

        xp += Math.floor(Math.random() * 5) + 3;

        levelXP.set(userId, xp);

        let lvl = levelNum.get(userId) || 1;

        if (xp >= lvl * 100) {
            lvl += 1;

            levelNum.set(userId, lvl);
            levelXP.set(userId, 0);

            message.channel.send(
                '🎉 **' +
                message.author.username +
                '** Seviye atladın! Yeni Seviyen: **' +
                lvl +
                '** 🚀'
            );
        }
    }

    // ================================
    // HIZLI KELİME YARIŞI
    // ================================

    if (aktifFastKelime.has(message.channel.id)) {
        const kelime = aktifFastKelime.get(message.channel.id);

        if (message.content.toLowerCase() === kelime.toLowerCase()) {
            aktifFastKelime.delete(message.channel.id);

            return message.reply(
                '🏁 **TEBRİKLER!** Kelimeyi ilk sen yazdın! 🏆'
            );
        }
    }

    // ================================
    // KOMUT KONTROL
    // ================================

    if (!message.content.startsWith('!')) return;

    const args = message.content
        .slice(1)
        .trim()
        .split(/\s+/);

    const command = args.shift().toLowerCase();

    // ==========================================
    // YARDIM MENÜSÜ
    // ==========================================

    if (command === 'help' || command === 'yardım') {
        const anaEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({
                name: 'Zaafsız Bot Yardım Menüsü',
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(
                '🏡 **Ana Menü**\nKategori panosuna geri dön\n\n' +
                '🐱 **Eğlence**\nEğlenceli komutlar\n\n' +
                '👑 **Kullanıcı**\nKullanıcı bilgileri\n\n' +
                '🔨 **Yetkili**\nYetkili araçları'
            );

        const menu = new StringSelectMenuBuilder()
            .setCustomId('yardim_menu')
            .setPlaceholder('📋 Bir kategori seçin...')
            .addOptions([
                {
                    label: 'Ana Menü',
                    value: 'ana_menu',
                    emoji: '🏡'
                },
                {
                    label: 'Eğlence',
                    value: 'eglence',
                    emoji: '🐱'
                },
                {
                    label: 'Kullanıcı',
                    value: 'kullanici',
                    emoji: '👑'
                },
                {
                    label: 'Yetkili',
                    value: 'yetkili',
                    emoji: '🔨'
                }
            ]);

        const rowMenu = new ActionRowBuilder()
            .addComponents(menu);

        return message.reply({
            embeds: [anaEmbed],
            components: [rowMenu]
        });
    }

    // ==========================================
    // DÜELLO
    // ==========================================

    if (command === '1vs1' || command === 'düello') {
        const hedef = message.mentions.users.first();

        if (!hedef || hedef.id === userId) {
            return message.reply('⚠️ Bir üye etiketle!');
        }

        const kazanan =
            Math.random() < 0.5
                ? message.author.username
                : hedef.username;

        return message.channel.send(
            '⚔️ **DÜELLO BAŞLADI!**\n👑 Kazanan: **' +
            kazanan +
            '**!'
        );
    }

    // ==========================================
    // ADAM ASMACA
    // ==========================================

    if (command === 'adamasmaca') {
        if (aktifAdamAsmaca.has(message.channel.id)) {
            return message.reply(
                '⚠️ Zaten aktif bir oyun var.'
            );
        }

        aktifAdamAsmaca.set(message.channel.id, {
            kelime: 'kanada',
            harfler: ['k', 'a', 'n', 'a', 'd', 'a'],
            tahminEdilenler: [],
            hak: 6
        });

        return message.reply(
            '🎮 **Adam Asmaca Başladı!** Kelime: `_ _ _ _ _ _` (6 Hak)'
        );
    }

    // ==========================================
    // FAST
    // ==========================================

    if (command === 'fast') {
        const kelime =
            fastKelimeHavuzu[
                Math.floor(
                    Math.random() * fastKelimeHavuzu.length
                )
            ];

        aktifFastKelime.set(
            message.channel.id,
            kelime
        );

        return message.channel.send(
            '🏁 **HIZLI YAZMA YARIŞI!**\n👉 **`' +
            kelime +
            '`**'
        );
    }

    // ==========================================
    // AFK
    // ==========================================

    if (command === 'afk') {
        const sebep = args.join(' ') || 'Uzakta.';

        afkKullanicilar.set(
            userId,
            sebep
        );

        return message.reply(
            '💤 AFK moduna geçtin.'
        );
    }

    // ==========================================
    // SHIP
    // ==========================================

    if (command === 'ship') {
        const oran =
            Math.floor(Math.random() * 100) + 1;

        return message.reply(
            '❤️ Aşk oranı: **%' +
            oran +
            '**'
        );
    }

    // ==========================================
    // RANK
    // ==========================================

    if (command === 'rank') {
        const level =
            levelNum.get(userId) || 1;

        const xp =
            levelXP.get(userId) || 0;

        return message.reply(
            '📊 Seviye: **' +
            level +
            '** | XP: **' +
            xp +
            '**'
        );
    }

    // ==========================================
    // AVATAR
    // ==========================================

    if (command === 'avatar') {
        const hedef =
            message.mentions.users.first() ||
            message.author;

        return message.reply(
            hedef.displayAvatarURL({
                size: 1024
            })
        );
    }

    // ==========================================
    // SUNUCU BİLGİ
    // ==========================================

    if (command === 'sunucubilgi') {
        if (!message.guild) {
            return message.reply(
                '❌ Bu komut sadece sunucuda kullanılabilir.'
            );
        }

        return message.reply(
            '🏰 Sunucu Adı: **' +
            message.guild.name +
            '** | Üye: **' +
            message.guild.memberCount +
            '**'
        );
    }

    // ==========================================
    // TEMİZLE
    // ==========================================

    if (command === 'temizle') {
        if (
            !message.member.permissions.has('ManageMessages')
        ) {
            return message.reply(
                '❌ Yetkin yok!'
            );
        }

        const miktar =
            parseInt(args[0]);

        if (
            !miktar ||
            miktar < 1 ||
            miktar > 100
        ) {
            return message.reply(
                '⚠️ 1-100 arası bir sayı gir.'
            );
        }

        await message.channel.bulkDelete(
            miktar,
            true
        );

        const silindiMesaji =
            await message.channel.send(
                '🧹 **' +
                miktar +
                '** mesaj silindi.'
            );

        setTimeout(() => {
            silindiMesaji
                .delete()
                .catch(() => {});
        }, 3000);

        return;
    }

    // ==========================================
    // SUSTUR
    // ==========================================

    if (
        command === 'sustur' ||
        command === 'mute'
    ) {
        if (
            !message.member.permissions.has('ModerateMembers')
        ) {
            return message.reply(
                '❌ Yetkin yok!'
            );
        }

        const hedefUser =
            message.mentions.users.first();

        if (!hedefUser) {
            return message.reply(
                '⚠️ Kullanım: `!sustur @üye <dakika>`'
            );
        }

        const hedef =
            message.guild.members.cache.get(
                hedefUser.id
            );

        const sure =
            parseInt(args[1]);

        if (!hedef || !sure || sure < 1) {
            return message.reply(
                '⚠️ Kullanım: `!sustur @üye <dakika>`'
            );
        }

        try {
            await hedef.timeout(
                sure * 60 * 1000
            );

            return message.reply(
                '🔇 **' +
                hedef.user.username +
                '** ' +
                sure +
                ' dakika susturuldu.'
            );
        } catch (error) {
            return message.reply(
                '❌ Üyeyi susturamadım. Bot yetkilerini kontrol et.'
            );
        }
    }

    // ==========================================
    // UYARI
    // ==========================================

    if (
        command === 'uyarı' ||
        command === 'uyar'
    ) {
        if (
            !message.member.permissions.has('KickMembers')
        ) {
            return message.reply(
                '❌ Yetkin yok!'
            );
        }

        const hedefUser =
            message.mentions.users.first();

        if (!hedefUser) {
            return message.reply(
                '⚠️ Üye etiketle.'
            );
        }

        const hedef =
            message.guild.members.cache.get(
                hedefUser.id
            );

        if (!hedef) {
            return message.reply(
                '⚠️ Üye bulunamadı.'
            );
        }

        let currentUyar =
            uyarilar.get(hedef.id) || 0;

        currentUyar += 1;

        uyarilar.set(
            hedef.id,
            currentUyar
        );

        if (currentUyar >= 3) {
            uyarilar.set(
                hedef.id,
                0
            );

            try {
                await hedef.timeout(
                    15 * 60 * 1000
                );

                return message.channel.send(
                    '🚨 **' +
                    hedef.user.username +
                    '** otomatik olarak **15 dakika susturuldu!**'
                );
            } catch (error) {
                return message.reply(
                    '❌ Otomatik susturma yapılamadı.'
                );
            }
        }

        return message.reply(
            '⚠️ **' +
            hedef.user.username +
            '** uyarıldı. (**' +
            currentUyar +
            '/3**)'
        );
    }
});

// ==========================================
// YARDIM MENÜSÜ ETKİLEŞİMLERİ
// ==========================================

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId !== 'yardim_menu') return;

    const secilen =
        interaction.values[0];

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({
            name: 'Zaafsız Bot Yardım Menüsü',
            iconURL:
                client.user.displayAvatarURL()
        });

    if (secilen === 'ana_menu') {
        embed.setDescription(
            '🏡 **Ana Menü**\nKategori panosuna geri dön\n\n' +
            '🐱 **Eğlence**\nEğlenceli komutlar\n\n' +
            '👑 **Kullanıcı**\nKullanıcı bilgileri\n\n' +
            '🔨 **Yetkili**\nYetkili araçları'
        );
    }

    if (secilen === 'eglence') {
        embed
            .setTitle(
                '🐱 Eğlence Komutları Listesi'
            )
            .setDescription(
                '`!1vs1 @üye` - Düello atarsınız.\n' +
                '`!adamasmaca` - Kelime oyunu.\n' +
                '`!fast` - Hızlı kelime yarışı.\n' +
                '`!afk <sebep>` - AFK modu.\n' +
                '`!ship @üye` - Aşk testi.'
            );
    }

    if (secilen === 'kullanici') {
        embed
            .setTitle(
                '👑 Kullanıcı Komutları Listesi'
            )
            .setDescription(
                '`!rank` - Seviye ve XP durumu.\n' +
                '`!avatar [@üye]` - Avatar gösterir.\n' +
                '`!sunucubilgi` - Sunucu bilgileri.'
            );
    }

    if (secilen === 'yetkili') {
        embed
            .setTitle(
                '🔨 Yetkili Komutları Listesi'
            )
            .setDescription(
                '`!temizle <miktar>` - Mesaj siler.\n' +
                '`!sustur @üye <dakika>` - Süreli susturma.\n' +
                '`!uyarı @üye` - Uyarı verir.'
            );
    }

    await interaction.update({
        embeds: [embed]
    });
});

// ==========================================
// BOT GİRİŞİ
// ==========================================

client.login(process.env.TOKEN);
