const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

// --- BELLEKLER ---
const levelXP = new Map(); const levelNum = new Map(); const uyarilar = new Map(); const afkKullanicilar = new Map(); 
const aktifAdamAsmaca = new Map(); const aktifFastKelime = new Map(); 
const fastKelimeHavuzu = ['kanada', 'vancouver', 'toronto', 'ottawa', 'ekonomi', 'dolar', 'akçaağaç', 'gurbet', 'yazılım', 'discord'];

// WEB SUNUCU
const app = express(); app.get('/', (req, res) => res.send('TheKanada Guard Bot Aktif!')); app.listen(process.env.PORT || 3000);

client.on('ready', () => {
    console.log("THEKANADA Botu basariyla sese baglaniyor...");
    const channelId = '1543153290823475211'; const guildId = '1540484134361636884';   
    const connectToVoice = () => { try { joinVoiceChannel({ channelId, guildId, adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator, selfDeaf: true, selfMute: true }); } catch (e) {} };
    connectToVoice(); setInterval(connectToVoice, 15 * 60 * 1000);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;

    // AFK Kontrol
    if (afkKullanicilar.has(userId)) { afkKullanicilar.delete(userId); message.reply("👋 Hoş geldin! AFK durumunu temizledim."); }
    message.mentions.users.forEach((user) => { if (afkKullanicilar.has(user.id)) message.reply(`💤 **${user.username}** şu an AFK! Sebep: \`${afkKullanicilar.get(user.id)}\``); });

    // Seviye Sistemi
    if (!message.content.startsWith('!')) {
        let xp = (levelXP.get(userId) || 0) + Math.floor(Math.random() * 5) + 3; levelXP.set(userId, xp);
        let lvl = levelNum.get(userId) || 1;
        if (xp >= lvl * 100) { levelNum.set(userId, lvl + 1); levelXP.set(userId, 0); message.channel.send(`🎉 **${message.author.username}** Seviye atladın! Yeni Seviyen: **${lvl + 1}** 🚀`); }
    }

    // Kelime Yarışı Dinleyici
    if (aktifFastKelime.has(message.channel.id) && message.content.toLowerCase() === aktifFastKelime.get(message.channel.id)) {
        aktifFastKelime.delete(message.channel.id); return message.reply("🏁 **TEBRİKLER!** Kelimeyi ilk sen yazdın kanka! 🏆");
    }

    // Komut Ayırma
    if (!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/); const command = args.shift().toLowerCase();

    // ==========================================
    // 📖 !HELP / !YARDIM KOMUTU (SADECE KANADA BUTONLU)
    // ==========================================
    if (command === 'help' || command === 'yardım') {
        const anaEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ name: 'THEKANADA Yardım Menüsü', iconURL: client.user.displayAvatarURL() })
            .setDescription(
                '🏡 **Ana Menü**\nKategori panosuna geri dön\n\n' +
                '🐱 **Eğlence**\nEğlenceli ve keyifli komutlar\n\n' +
                '👑 **Kullanıcı**\nProfil ve kullanıcı bilgileri\n\n' +
                '🔨 **Yetkili**\nYetkili yönetim araçları'
            );

        const menu = new StringSelectMenuBuilder()
            .setCustomId('yardim_menu')
            .setPlaceholder('📋 Bir kategori seçin...')
            .addOptions([
                { label: 'Ana Menü', description: 'Giriş sayfasına döner.', value: 'ana_menu', emoji: '🏡' },
                { label: 'Eğlence', description: 'Eğlence ve oyun komutları.', value: 'eglence', emoji: '🐱' },
                { label: 'Kullanıcı', description: 'Profil ve kullanıcı bilgileri.', value: 'kullanici', emoji: '👑' },
                { label: 'Yetkili', description: 'Yetkili yönetim komutları.', value: 'yetkili', emoji: '🔨' }
            ]);

        // Sadece Kanada Yönlendirme Butonu Kalacak Şekilde Düzenlendi
        const kanadaButon = new ButtonBuilder()
            .setLabel('Kanada')
            .setStyle(ButtonStyle.Link)
            .setURL('https://vercel.app')
            .setEmoji('🍁');

        const rowMenu = new ActionRowBuilder().addComponents(menu);
        const rowButtons = new ActionRowBuilder().addComponents(kanadaButon);

        return message.reply({ embeds: [anaEmbed], components: [rowMenu, rowButtons] });
    }

    // --- DİĞER MODERASYON KOMUTLARI ---
    if (command === '1vs1' || command === 'düello') {
        const hedef = message.mentions.users.first(); if (!hedef || hedef.id === userId) return message.reply('⚠️ Bir üye etiketle!');
        return message.channel.send(`⚔️ **DÜELLO BAŞLADI!**\n👑 Kazanan: **${Math.random() < 0.5 ? message.author.username : hedef.username}**!`);
    }
    if (command === 'adamasmaca') {
        if (aktifAdamAsmaca.has(message.channel.id)) return message.reply('⚠️ Zaten aktif oyun var.');
        aktifAdamAsmaca.set(message.channel.id, { kelime: 'kanada', harfler: ['k','a','n','a','d','a'], tahminEdilenler: [], hak: 6 });
        return message.reply('🎮 **Adam Asmaca Başladı!** Kelime: `_ _ _ _ _ _` (6 Hak)');
    }
    if (command === 'fast') {
        const kelime = fastKelimeHavuzu[Math.floor(Math.random() * fastKelimeHavuzu.length)]; aktifFastKelime.set(message.channel.id, kelime);
        return message.channel.send(`🏁 **HIZLI YAZMA YARIŞI!**:\n👉 **\`${kelime}\`**`);
    }
    if (command === 'afk') { afkKullanicilar.set(userId, args.join(' ') || 'Uzakta.'); return message.reply("💤 AFK moduna geçtin."); }
    if (command === 'ship') { return message.reply(`❤️ Aşk oranı: **%${Math.floor(Math.random() * 100) + 1}** 👩‍❤️‍👨`); }
    if (command === 'rank') { return message.reply(`📊 Seviye: **${levelNum.get(userId) || 1}** | XP: **${levelXP.get(userId) || 0}**`); }
    if (command === 'avatar') { return message.reply((message.mentions.users.first() || message.author).displayAvatarURL({ size: 1024 })); }
    if (command === 'sunucubilgi') { return message.reply(`🏰 Sunucu Adı: **${message.guild.name}** | Üye: **${message.guild.memberCount}**`); }
    
    if (command === 'temizle') {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Yetkin yok!');
        const miktar = parseInt(args); if (!miktar || miktar < 1 || miktar > 100) return message.reply('⚠️ 1-100 arası sayı gir.');
        await message.channel.bulkDelete(miktar, true); const s = await message.channel.send(`🧹 **${miktar}** mesaj silindi.`); setTimeout(() => s.delete().catch(() => {}), 3000);
    }
    if (command === 'sustur' || command === 'mute') {
        if (!message.member.permissions.has('MuteMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); const sure = parseInt(args);
        if (!hedef || !sure) return message.reply('⚠️ Kullanım: `!sustur @üye <dakika>`');
        try { await hedef.timeout(sure * 60 * 1000); return message.reply(`🔇 **${hedef.user.username}** ${sure} dk susturuldu.`); } catch(e) { return message.reply('❌ Yetkim yetmiyor.'); }
    }
});

// --- MENÜ ETKİLEŞİM DİNLEYİCİSİ ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'yardim_menu') return;

    const secilen = String(interaction.values[0]); 
    const embed = new EmbedBuilder().setColor('#ff0000').setAuthor({ name: 'THEKANADA Yardım Menüsü', iconURL: client.user.displayAvatarURL() });

    if (secilen === 'ana_menu') {
        embed.setDescription('🏡 **Ana Menü**\nKategori panosuna geri dön\n\n🐱 **Eğlence**\nEğlenceli ve keyifli komutlar\n\n👑 **Kullanıcı**\nProfil ve kullanıcı bilgileri\n\n🔨 **Yetkili**\nYetkili yönetim araçları');
    } else if (secilen === 'eglence') {
        embed.setTitle('🐱 Eğlence Komutları Listesi').setDescription('`!1vs1 @üye` - Düello atarsınız.\n`!adamasmaca` - Kelime oyunu oynatır.\n`!fast` - Hızlı kelime yazma yarışı.\n`!fakemesaj @üye <mesaj>` - Sahte mesaj atar.\n`!afk <sebep>` - AFK moduna geçer.\n`!ship @üye` - Aşk testi yapar.');
    } else if (secilen === 'kullanici') {
        embed.setTitle('👑 Kullanıcı Komutları Listesi').setDescription('`!rank` - Güncel seviyenizi ve XP durumunuzu gösterir.\n`!avatar [@üye]` - Profil fotoğrafını büyütür.\n`!sunucubilgi` - Sunucu istatistiklerini gösterir.');
    } else if (secilen === 'yetkili') {
        embed.setTitle('🔨 Yetkili Komutları Listesi').setDescription('`!temizle <miktar>` - Belirtilen miktarda mesajı siler.\n`!sustur @üye <dakika>` - Kullanıcıyı süreli mutelar.\n`!uyarı @üye` - Kullanıcıya ceza puanı ekler (3/3 olunca otomatik mute).');
    }

    await interaction.update({ embeds: [embed] });
});

client.login(process.env.TOKEN);
