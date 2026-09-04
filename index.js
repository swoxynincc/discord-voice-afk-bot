```
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

// LOG KANALI ID'Sİ
const logKanaliId = '1545048504421064736';

// WEB SUNUCU
const app = express(); app.get('/', (req, res) => res.send('TheKanada Guard Bot Aktif!')); app.listen(process.env.PORT || 3000);

client.on('ready', () => {
    console.log(`${client.user.tag} Kanada Temalı Menü ve Log Sistemiyle Aktif!`);
    const channelId = '1543153290823475211'; const guildId = '1540484134361636884';   
    const connectToVoice = () => { try { joinVoiceChannel({ channelId, guildId, adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator, selfDeaf: true, selfMute: true }); } catch (e) {} };
    connectToVoice(); setInterval(connectToVoice, 15 * 60 * 1000);
});

// Gelişmiş Log Gönderme Fonksiyonu
async function logGonder(guild, baslik, aciklama, renk = '#ff0000') {
    try {
        const kanal = await guild.channels.fetch(logKanaliId);
        if (kanal) {
            const logEmbed = new EmbedBuilder()
                .setColor(renk)
                .setTitle(`📝 KANADA LOG | ${baslik}`)
                .setDescription(aciklama)
                .setTimestamp();
            await kanal.send({ embeds: [logEmbed] });
        }
    } catch (e) { console.error("Log kanalına mesaj gönderilemedi:", e); }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;

    // AFK Kontrol ve Loglama
    if (afkKullanicilar.has(userId)) { 
        afkKullanicilar.delete(userId); 
        message.reply(`👋 Hoş geldin! AFK durumunu temizledim.`); 
        logGonder(message.guild, "AFK İptal", `**${message.author.tag}** chate yazarak AFK modundan çıktı.`, '#00ff00');
    }
    message.mentions.users.forEach((user) => { 
        if (afkKullanicilar.has(user.id)) message.reply(`💤 **${user.username}** şu an AFK! Sebep: \`${afkKullanicilar.get(user.id)}\``); 
    });

    // Seviye Sistemi
    if (!message.content.startsWith('!')) {
        let xp = (levelXP.get(userId) || 0) + Math.floor(Math.random() * 5) + 3; levelXP.set(userId, xp);
        let lvl = levelNum.get(userId) || 1;
        if (xp >= lvl * 100) { 
            levelNum.set(userId, lvl + 1); levelXP.set(userId, 0); 
            message.channel.send(`🎉 **${message.author.username}** Seviye atladın! Yeni Seviyen: **${lvl + 1}** 🚀`); 
            logGonder(message.guild, "Seviye Atlama", `**${message.author.tag}** konuşarak **Seviye ${lvl + 1}** oldu!`, '#ffff00');
        }
    }

    // Kelime Yarışı Dinleyici ve Loglama
    if (aktifFastKelime.has(message.channel.id) && message.content.toLowerCase() === aktifFastKelime.get(message.channel.id)) {
        aktifFastKelime.delete(message.channel.id); 
        message.reply(`🏁 **TEBRİKLER!** Kelimeyi ilk sen yazdın kanka! 🏆`);
        logGonder(message.guild, "Kelime Yarışı Kazanıldı", `**${message.author.tag}**, kelime yarışmasını kelimeyi ilk yazarak kazandı.`, '#00ff00');
        return;
    }

    // Komut Ayırma
    if (!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/); const command = args.shift().toLowerCase();

    // ==========================================
    // 📖 !HELP / !YARDIM KOMUTU (%100 TEMİZ KANADA TASARIMI)
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

        // SADECE KANADA BUTONU (Diğer yönlendirmeler silindi)
        const kanadaButon = new ButtonBuilder()
            .setLabel('Kanada')
            .setStyle(ButtonStyle.Link)
            .setURL('https://thekanada.vercel.app')
            .setEmoji('🍁');

        const rowMenu = new ActionRowBuilder().addComponents(menu);
        const rowButtons = new ActionRowBuilder().addComponents(kanadaButon);

        logGonder(message.guild, "Yardım Menüsü Açıldı", `**${message.author.tag}** isimli üye chate \`!help\` yazarak yardım menüsünü çağırdı.`, '#3498db');
        return message.reply({ embeds: [anaEmbed], components: [rowMenu, rowButtons] });
    }

    // --- DİĞER MODERASYON KOMUTLARI & LOGLARI ---
    if (command === '1vs1' || command === 'düello') {
        const hedef = message.mentions.users.first(); if (!hedef || hedef.id === userId) return message.reply('⚠️ Bir üye etiketle!');
        const kazanan = Math.random() < 0.5 ? message.author.username : hedef.username;
        logGonder(message.guild, "Düello Atıldı", `**${message.author.tag}** ile **${hedef.tag}** düello attı. Kazanan: **${kazanan}**`);
        return message.channel.send(`⚔️ **DÜELLO BAŞLADI!**\n👑 Kazanan: **${kazanan}**!`);
    }
    if (command === 'adamasmaca') {
        if (aktifAdamAsmaca.has(message.channel.id)) return message.reply('⚠️ Zaten aktif oyun var.');
        aktifAdamAsmaca.set(message.channel.id, { kelime: 'kanada', harfler: ['k','a','n','a','d','a'], tahminEdilenler: [], hak: 6 });
        logGonder(message.guild, "Oyun Başladı", `**${message.author.tag}** tarafından Adam Asmaca oyunu başlatıldı.`);
        return message.reply('🎮 **Adam Asmaca Başladı!** Kelime: \`_ _ _ _ _ _\` (6 Hak)');
    }
    if (command === 'fast') {
        const kelime = fastKelimeHavuzu[Math.floor(Math.random() * fastKelimeHavuzu.length)]; aktifFastKelime.set(message.channel.id, kelime);
        logGonder(message.guild, "Kelime Yarışı Başladı", `**${message.author.tag}** tarafından kelime yarışı tetiklendi.`);
        return message.channel.send(`🏁 **HIZLI YAZMA YARIŞI!**:\n👉 **\`${kelime}\`**`);
    }
    if (command === 'afk') { 
        const sebep = args.join(' ') || 'Uzakta.'; afkKullanicilar.set(userId, sebep); 
        logGonder(message.guild, "AFK Modu", `**${message.author.tag}** şu sebeple AFK oldu: \`${sebep}\``, '#95a5a6');
        return message.reply(`💤 AFK moduna geçtin.`); 
    }
    
    if (command === 'temizle') {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Yetkin yok!');
        const miktar = parseInt(args); if (!miktar || miktar < 1 || miktar > 100) return message.reply('⚠️ 1-100 arası sayı gir.');
        await message.channel.bulkDelete(miktar, true); 
        const s = await message.channel.send(`🧹 **${miktar}** mesaj silindi.`); setTimeout(() => s.delete().catch(() => {}), 3000);
        logGonder(message.guild, "Chat Temizleme", `**${message.author.tag}**, <#${message.channel.id}> kanalından **${miktar}** adet mesaj sildi!`, '#e67e22');
    }
    if (command === 'sustur' || command === 'mute') {
        if (!message.member.permissions.has('MuteMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); const sure = parseInt(args);
        if (!hedef || !sure) return message.reply('⚠️ Kullanım: `!sustur @üye <dakika>`');
        try { 
            await hedef.timeout(sure * 60 * 1000); 
            logGonder(message.guild, "Susturma Cezası", `**${message.author.tag}** yetkilisi **${hedef.user.tag}** kullanıcısını **${sure} dakika** susturdu!`, '#95a5a6');
            return message.reply(`🔇 **${hedef.user.username}** ${sure} dk susturuldu.`); 
        } catch(e) { return message.reply('❌ Yetkim yetmiyor.'); }
    }
    if (command === 'uyarı' || command === 'uyar') {
        if (!message.member.permissions.has('KickMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); if (!hedef) return message.reply('⚠️ Üye etiketle.');
        let currentUyar = uyarilar.get(hedef.id) || 0; currentUyar += 1; uyarilar.set(hedef.id, currentUyar);
        
        logGonder(message.guild, "Kullanıcı Uyarıldı", `**${message.author.tag}** yetkilisi **${hedef.user.tag}** üyesine uyarı attı. (Durum: ${currentUyar}/3)`, '#e74c3c');
        
        if (currentUyar >= 3) {
            uyarilar.set(hedef.id, 0);
            try { 
                await hedef.timeout(15 * 60 * 1000); 

```

Kodu dikkatli kullanın.

svg

logGonder(message.guild, "Otomatik Mute (3/3 Uyarı)", `**${hedef.user.tag}** 3 uyarı sınırına ulaştığı için sistem tarafından otomatik **15 dk mute** yedi!`, '#c0392b');
return message.channel.send(`🚨 **${hedef.user.username}** 3 uyarı nedeniyle otomatik **15 dk mute** yedi!`);
} catch (e) {}
}
return message.reply(`⚠️ **${hedef.user.username}** uyarıldı. (**${currentUyar}/3**)`);
}
});

// --- MENÜ ETKİLEŞİM DİNLEYİCİSİ ---
client.on('interactionCreate', async (interaction) => {
if (!interaction.isStringSelectMenu() || interaction.customId !== 'yardim\_menu') return;

const secilen = interaction.values[0]; // JavaScript dizisinden değeri çekiyoruz
const embed = new EmbedBuilder().setColor('#ff0000').setAuthor({ name: 'THEKANADA Yardım Menüsü', iconURL: client.user.displayAvatarURL() });

if (secilen === 'ana\_menu') {
embed.setDescription('🏡 **Ana Menü**\nKategori panosuna geri dön\n\n🐱 **Eğlence**\nEğlenceli ve keyifli komutlar\n\n👑 **Kullanıcı**\nProfil ve kullanıcı bilgileri\n\n🔨 **Yetkili**\nYetkili yönetim araçları');
} else if (secilen === 'eglence') {
embed.setTitle('🐱 Eğlence Komutları Listesi').setDescription('`!1vs1 @üye` - Düello atarsınız.\n`!adamasmaca` - Kelime oyunu oynatır.\n`!fast` - Hızlı kelime yazma yarışı.\n`!fakemesaj @üye <mesaj>` - Sahte mesaj atar.\n`!afk <sebep>` - AFK moduna geçer.\n`!ship @üye` - Aşk testi yapar.');
} else if (secilen === 'kullanici') {
embed.setTitle('👑 Kullanıcı Komutları Listesi').setDescription('`!rank` - Güncel seviyenizi ve XP durumunuzu gösterir.\n`!avatar [@üye]` - Profil fotoğrafını büyütür.\n`!sunucubilgi` - Sunucu istatistiklerini gösterir.');
} else if (secilen === 'yetkili') {
embed.setTitle('🔨 Yetkili Komutları Listesi').setDescription('`!temizle <miktar>` - Belirtilen miktarda mesajı siler.\n`!sustur @üye <dakika>` - Kullanıcıyı süreli mutelar.\n`!uyarı @üye` - Kullanıcıya ceza puanı ekler (3/3 olunca otomatik mute).');
}

logGonder(interaction.guild, "Menü Kategorisi Değiştirildi", `**${interaction.user.tag}** yardım menüsünde **${secilen.toUpperCase()}** sekmesine geçiş yaptı.`, '#1abc9c');
await interaction.update({ embeds: [embed] });
});

client.login(process.env.TOKEN);

```
``````
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

// LOG KANALI ID'Sİ
const logKanaliId = '1545048504421064736';

// WEB SUNUCU
const app = express(); app.get('/', (req, res) => res.send('TheKanada Guard Bot Aktif!')); app.listen(process.env.PORT || 3000);

client.on('ready', () => {
    console.log(`${client.user.tag} Kanada Temalı Menü ve Log Sistemiyle Aktif!`);
    const channelId = '1543153290823475211'; const guildId = '1540484134361636884';   
    const connectToVoice = () => { try { joinVoiceChannel({ channelId, guildId, adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator, selfDeaf: true, selfMute: true }); } catch (e) {} };
    connectToVoice(); setInterval(connectToVoice, 15 * 60 * 1000);
});

// Gelişmiş Log Gönderme Fonksiyonu
async function logGonder(guild, baslik, aciklama, renk = '#ff0000') {
    try {
        const kanal = await guild.channels.fetch(logKanaliId);
        if (kanal) {
            const logEmbed = new EmbedBuilder()
                .setColor(renk)
                .setTitle(`📝 KANADA LOG | ${baslik}`)
                .setDescription(aciklama)
                .setTimestamp();
            await kanal.send({ embeds: [logEmbed] });
        }
    } catch (e) { console.error("Log kanalına mesaj gönderilemedi:", e); }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;

    // AFK Kontrol ve Loglama
    if (afkKullanicilar.has(userId)) { 
        afkKullanicilar.delete(userId); 
        message.reply(`👋 Hoş geldin! AFK durumunu temizledim.`); 
        logGonder(message.guild, "AFK İptal", `**${message.author.tag}** chate yazarak AFK modundan çıktı.`, '#00ff00');
    }
    message.mentions.users.forEach((user) => { 
        if (afkKullanicilar.has(user.id)) message.reply(`💤 **${user.username}** şu an AFK! Sebep: \`${afkKullanicilar.get(user.id)}\``); 
    });

    // Seviye Sistemi
    if (!message.content.startsWith('!')) {
        let xp = (levelXP.get(userId) || 0) + Math.floor(Math.random() * 5) + 3; levelXP.set(userId, xp);
        let lvl = levelNum.get(userId) || 1;
        if (xp >= lvl * 100) { 
            levelNum.set(userId, lvl + 1); levelXP.set(userId, 0); 
            message.channel.send(`🎉 **${message.author.username}** Seviye atladın! Yeni Seviyen: **${lvl + 1}** 🚀`); 
            logGonder(message.guild, "Seviye Atlama", `**${message.author.tag}** konuşarak **Seviye ${lvl + 1}** oldu!`, '#ffff00');
        }
    }

    // Kelime Yarışı Dinleyici ve Loglama
    if (aktifFastKelime.has(message.channel.id) && message.content.toLowerCase() === aktifFastKelime.get(message.channel.id)) {
        aktifFastKelime.delete(message.channel.id); 
        message.reply(`🏁 **TEBRİKLER!** Kelimeyi ilk sen yazdın kanka! 🏆`);
        logGonder(message.guild, "Kelime Yarışı Kazanıldı", `**${message.author.tag}**, kelime yarışmasını kelimeyi ilk yazarak kazandı.`, '#00ff00');
        return;
    }

    // Komut Ayırma
    if (!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/); const command = args.shift().toLowerCase();

    // ==========================================
    // 📖 !HELP / !YARDIM KOMUTU
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

        const kanadaButon = new ButtonBuilder()
            .setLabel('Kanada')
            .setStyle(ButtonStyle.Link)
            .setURL('https://vercel.app')
            .setEmoji('🍁');

        const rowMenu = new ActionRowBuilder().addComponents(menu);
        const rowButtons = new ActionRowBuilder().addComponents(kanadaButon);

        logGonder(message.guild, "Yardım Menüsü Açıldı", `**${message.author.tag}** isimli üye chate \`!help\` yazarak yardım menüsünü çağırdı.`, '#3498db');
        return message.reply({ embeds: [anaEmbed], components: [rowMenu, rowButtons] });
    }

    // --- DİĞER MODERASYON KOMUTLARI & LOGLARI ---
    if (command === '1vs1' || command === 'düello') {
        const hedef = message.mentions.users.first(); if (!hedef || hedef.id === userId) return message.reply('⚠️ Bir üye etiketle!');
        const kazanan = Math.random() < 0.5 ? message.author.username : hedef.username;
        logGonder(message.guild, "Düello Atıldı", `**${message.author.tag}** ile **${hedef.tag}** düello attı. Kazanan: **${kazanan}**`);
        return message.channel.send(`⚔️ **DÜELLO BAŞLADI!**\n👑 Kazanan: **${kazanan}**!`);
    }
    if (command === 'adamasmaca') {
        if (aktifAdamAsmaca.has(message.channel.id)) return message.reply('⚠️ Zaten aktif oyun var.');
        aktifAdamAsmaca.set(message.channel.id, { kelime: 'kanada', harfler: ['k','a','n','a','d','a'], tahminEdilenler: [], hak: 6 });
        logGonder(message.guild, "Oyun Başladı", `**${message.author.tag}** tarafından Adam Asmaca oyunu başlatıldı.`);
        return message.reply('🎮 **Adam Asmaca Başladı!** Kelime: \`_ _ _ _ _ _\` (6 Hak)');
    }
    if (command === 'fast') {
        const kelime = fastKelimeHavuzu[Math.floor(Math.random() * fastKelimeHavuzu.length)]; aktifFastKelime.set(message.channel.id, kelime);
        logGonder(message.guild, "Kelime Yarışı Başladı", `**${message.author.tag}** tarafından kelime yarışı tetiklendi.`);
        return message.channel.send(`🏁 **HIZLI YAZMA YARIŞI!**:\n👉 **\`${kelime}\`**`);
    }
    if (command === 'afk') { 
        const sebep = args.join(' ') || 'Uzakta.'; afkKullanicilar.set(userId, sebep); 
        logGonder(message.guild, "AFK Modu", `**${message.author.tag}** şu sebeple AFK oldu: \`${sebep}\``, '#95a5a6');
        return message.reply(`💤 AFK moduna geçtin.`); 
    }
    
    if (command === 'temizle') {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Yetkin yok!');
        const miktar = parseInt(args); if (!miktar || miktar < 1 || miktar > 100) return message.reply('⚠️ 1-100 arası sayı gir.');
        await message.channel.bulkDelete(miktar, true); 
        const s = await message.channel.send(`🧹 **${miktar}** mesaj silindi.`); setTimeout(() => s.delete().catch(() => {}), 3000);
        logGonder(message.guild, "Chat Temizleme", `**${message.author.tag}**, <#${message.channel.id}> kanalından **${miktar}** adet mesaj sildi!`, '#e67e22');
    }
    if (command === 'sustur' || command === 'mute') {
        if (!message.member.permissions.has('MuteMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); const sure = parseInt(args);
        if (!hedef || !sure) return message.reply('⚠️ Kullanım: `!sustur @üye <dakika>`');
        try { 
            await hedef.timeout(sure * 60 * 1000); 
            logGonder(message.guild, "Susturma Cezası", `**${message.author.tag}** yetkilisi **${hedef.user.tag}** kullanıcısını **${sure} dakika** susturdu!`, '#95a5a6');
            return message.reply(`🔇 **${hedef.user.username}** ${sure} dk susturuldu.`); 
        } catch(e) { return message.reply('❌ Yetkim yetmiyor.'); }
    }
    if (command === 'uyarı' || command === 'uyar') {
        if (!message.member.permissions.has('KickMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); if (!hedef) return message.reply('⚠️ Üye etiketle.');
        let currentUyar = uyarilar.get(hedef.id) || 0; currentUyar += 1; uyarilar.set(hedef.id, currentUyar);
        
        logGonder(message.guild, "Kullanıcı Uyarıldı", `**${message.author.tag}** yetkilisi **${hedef.user.tag}** üyesine uyarı attı. (Durum: ${currentUyar}/3)`, '#e74c3c');
        
        if (currentUyar >= 3) {
            uyarilar.set(hedef.id, 0);
            try { 
                await hedef.timeout(15 * 60 * 1000); 
                logGonder(message.guild, "Otomatik Mute (3/3 Uyarı)", `**${hedef.user.tag}** 3 uyarı sınırına ulaştığı için sistem tarafından otomatik **15 dk mute** yedi!`, '#c0392b');

return message.channel.send(`🚨 **${hedef.user.username}** 3 uyarı nedeniyle otomatik **15 dk mute** yedi!`);
} catch (e) {}
}
return message.reply(`⚠️ **${hedef.user.username}** uyarıldı. (**${currentUyar}/3**)`);
}
});

// --- MENÜ ETKİLEŞİM DİNLEYİCİSİ ---
client.on('interactionCreate', async (interaction) => {
if (!interaction.isStringSelectMenu() || interaction.customId !== 'yardim\_menu') return;

const secilen = interaction.values[0];
const embed = new EmbedBuilder().setColor('#ff0000').setAuthor({ name: 'THEKANADA Yardım Menüsü', iconURL: client.user.displayAvatarURL() });

if (secilen === 'ana\_menu') {
embed.setDescription('🏡 **Ana Menü**\nKategori panosuna geri dön\n\n🐱 **Eğlence**\nEğlenceli ve keyifli komutlar\n\n👑 **Kullanıcı**\nProfil ve kullanıcı bilgileri\n\n🔨 **Yetkili**\nYetkili yönetim araçları');
} else if (secilen === 'eglence') {
embed.setTitle('🐱 Eğlence Komutları Listesi').setDescription('`!1vs1 @üye` - Düello atarsınız.\n`!adamasmaca` - Kelime oyunu oynatır.\n`!fast` - Hızlı kelime yazma yarışı.\n`!fakemesaj @üye <mesaj>` - Sahte mesaj atar.\n`!afk <sebep>` - AFK moduna geçer.\n`!ship @üye` - Aşk testi yapar.');
} else if (secilen === 'kullanici') {
embed.setTitle('👑 Kullanıcı Komutları Listesi').setDescription('`!rank` - Güncel seviyenizi ve XP durumunuzu gösterir.\n`!avatar [@üye]` - Profil fotoğrafını büyütür.\n`!sunucubilgi` - Sunucu istatistiklerini gösterir.');
} else if (secilen === 'yetkili') {
embed.setTitle('🔨 Yetkili Komutları Listesi').setDescription('`!temizle <miktar>` - Belirtilen miktarda mesajı siler.\n`!sustur @üye <dakika>` - Kullanıcıyı süreli mutelar.\n`!uyarı @üye` - Kullanıcıya ceza puanı ekler (3/3 olunca otomatik mute).');
}

logGonder(interaction.guild, "Menü Kategorisi Değiştirildi", `**${interaction.user.tag}** yardım menüsünde **${secilen.toUpperCase()}** sekmesine geçiş yaptı.`, '#1abc9c');
await interaction.update({ embeds: [embed] });
});

client.login(process.env.TOKEN);

```
``````
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
    console.log(`${client.user.tag} Kanada Temalı Menü Sistemiyle Aktif!`);
    const channelId = '1543153290823475211'; const guildId = '1540484134361636884';   
    const connectToVoice = () => { try { joinVoiceChannel({ channelId, guildId, adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator, selfDeaf: true, selfMute: true }); } catch (e) {} };
    connectToVoice(); setInterval(connectToVoice, 15 * 60 * 1000);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;

    // AFK Kontrol
    if (afkKullanicilar.has(userId)) { 
        afkKullanicilar.delete(userId); 
        message.reply(`👋 Hoş geldin! AFK durumunu temizledim.`); 
    }
    message.mentions.users.forEach((user) => { 
        if (afkKullanicilar.has(user.id)) message.reply(`💤 **${user.username}** şu an AFK! Sebep: \`${afkKullanicilar.get(user.id)}\``); 
    });

    // Seviye Sistemi
    if (!message.content.startsWith('!')) {
        let xp = (levelXP.get(userId) || 0) + Math.floor(Math.random() * 5) + 3; levelXP.set(userId, xp);
        let lvl = levelNum.get(userId) || 1;
        if (xp >= lvl * 100) { 
            levelNum.set(userId, lvl + 1); levelXP.set(userId, 0); 
            message.channel.send(`🎉 **${message.author.username}** Seviye atladın! Yeni Seviyen: **${lvl + 1}** 🚀`); 
        }
    }

    // Kelime Yarışı Dinleyici
    if (aktifFastKelime.has(message.channel.id) && message.content.toLowerCase() === aktifFastKelime.get(message.channel.id)) {
        aktifFastKelime.delete(message.channel.id); 
        message.reply(`🏁 **TEBRİKLER!** Kelimeyi ilk sen yazdın kanka! 🏆`);
        return;
    }

    // Komut Ayırma
    if (!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/); const command = args.shift().toLowerCase();

    // ==========================================
    // 📖 !HELP / !YARDIM KOMUTU
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
        const kazanan = Math.random() < 0.5 ? message.author.username : hedef.username;
        return message.channel.send(`⚔️ **DÜELLO BAŞLADI!**\n👑 Kazanan: **${kazanan}**!`);
    }
    if (command === 'adamasmaca') {
        if (aktifAdamAsmaca.has(message.channel.id)) return message.reply('⚠️ Zaten aktif oyun var.');
        aktifAdamAsmaca.set(message.channel.id, { kelime: 'kanada', harfler: ['k','a','n','a','d','a'], tahminEdilenler: [], hak: 6 });
        return message.reply('🎮 **Adam Asmaca Başladı!** Kelime: \`_ _ _ _ _ _\` (6 Hak)');
    }
    if (command === 'fast') {
        const kelime = fastKelimeHavuzu[Math.floor(Math.random() * fastKelimeHavuzu.length)]; aktifFastKelime.set(message.channel.id, kelime);
        return message.channel.send(`🏁 **HIZLI YAZMA YARIŞI!**:\n👉 **\`${kelime}\`**`);
    }
    if (command === 'afk') { 
        const sebep = args.join(' ') || 'Uzakta.'; afkKullanicilar.set(userId, sebep); 
        return message.reply(`💤 AFK moduna geçtin.`); 
    }
    if (command === 'ship') {
        const hedef = message.mentions.users.first(); if (!hedef) return message.reply('⚠️ Kiminle aşkını ölçeceksin?');
        return message.reply(`❤️ **${message.author.username}** ile **${hedef.username}** arasındaki aşk oranı: **%${Math.floor(Math.random() * 100) + 1}** 👩‍❤️‍👨`);
    }
    if (command === 'rank') {
        const level = levelNum.get(userId) || 1; const xp = levelXP.get(userId) || 0;
        return message.reply(`📊 **Profil Durumun**:\nSeviye: **${level}**\nXP: **${xp}/${level * 100}**`);
    }
    if (command === 'avatar') {
        const kullanıcı = message.mentions.users.first() || message.author;
        return message.reply(kullanıcı.displayAvatarURL({ dynamic: true, size: 1024 }));
    }
    if (command === 'sunucubilgi') {
        return message.reply(`🏰 **Sunucu Bilgileri**:\nAdı: **${message.guild.name}**\nÜye Sayısı: **${message.guild.memberCount}**`);
    }
    
    if (command === 'temizle') {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Yetkin yok!');
        const miktar = parseInt(args); if (!miktar || miktar < 1 || miktar > 100) return message.reply('⚠️ 1-100 arası sayı gir.');
        await message.channel.bulkDelete(miktar, true); 
        const s = await message.channel.send(`🧹 **${miktar}** mesaj silindi.`); setTimeout(() => s.delete().catch(() => {}), 3000);
    }
    if (command === 'sustur' || command === 'mute') {
        if (!message.member.permissions.has('MuteMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); const sure = parseInt(args);
        if (!hedef || !sure) return message.reply('⚠️ Kullanım: `!sustur @üye <dakika>`');
        try { 
            await hedef.timeout(sure * 60 * 1000); 
            return message.reply(`🔇 **${hedef.user.username}** ${sure} dk susturuldu.`); 
        } catch(e) { return message.reply('❌ Yetkim yetmiyor.'); }
    }
    if (command === 'uyarı' || command === 'uyar') {
        if (!message.member.permissions.has('KickMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); if (!hedef) return message.reply('⚠️ Üye etiketle.');
        let currentUyar = uyarilar.get(hedef.id) || 0; currentUyar += 1; uyarilar.set(hedef.id, currentUyar);
        
        if (currentUyar >= 3) {
            uyarilar.set(hedef.id, 0);
            try { 
                await hedef.timeout(15 * 60 * 1000); 
                return message.channel.send(`🚨 **${hedef.user.username}** 3 uyarı nedeniyle otomatik **15 dk mute** yedi!`); 
            } catch (e) {}
        }
        return message.reply(`⚠️ **${hedef.user.username}** uyarıldı. (**${currentUyar}/3**)`);
    }
});

// --- MENÜ ETKİLEŞİM DİNLEYİCİSİ ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'yardim_menu') return;

    const secilen = interaction.values[0]; 
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

```
``````
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
    // Hatalı tırnak satırı tamamen düz metne çevrildi!
    console.log("Kanada Temalı Menü Sistemiyle Aktif!");
    const channelId = '1543153290823475211'; const guildId = '1540484134361636884';   
    const connectToVoice = () => { try { joinVoiceChannel({ channelId, guildId, adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator, selfDeaf: true, selfMute: true }); } catch (e) {} };
    connectToVoice(); setInterval(connectToVoice, 15 * 60 * 1000);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const userId = message.author.id;

    // AFK Kontrol
    if (afkKullanicilar.has(userId)) { 
        afkKullanicilar.delete(userId); 
        message.reply("👋 Hoş geldin! AFK durumunu temizledim."); 
    }
    message.mentions.users.forEach((user) => { 
        if (afkKullanicilar.has(user.id)) message.reply(`💤 **${user.username}** şu an AFK! Sebep: \`${afkKullanicilar.get(user.id)}\``); 
    });

    // Seviye Sistemi
    if (!message.content.startsWith('!')) {
        let xp = (levelXP.get(userId) || 0) + Math.floor(Math.random() * 5) + 3; levelXP.set(userId, xp);
        let lvl = levelNum.get(userId) || 1;
        if (xp >= lvl * 100) { 
            levelNum.set(userId, lvl + 1); levelXP.set(userId, 0); 
            message.channel.send(`🎉 **${message.author.username}** Seviye atladın! Yeni Seviyen: **${lvl + 1}** 🚀`); 
        }
    }

    // Kelime Yarışı Dinleyici
    if (aktifFastKelime.has(message.channel.id) && message.content.toLowerCase() === aktifFastKelime.get(message.channel.id)) {
        aktifFastKelime.delete(message.channel.id); 
        message.reply("🏁 **TEBRİKLER!** Kelimeyi ilk sen yazdın kanka! 🏆");
        return;
    }

    // Komut Ayırma
    if (!message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/); const command = args.shift().toLowerCase();

    // ==========================================
    // 📖 !HELP / !YARDIM KOMUTU
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
        const kazanan = Math.random() < 0.5 ? message.author.username : hedef.username;
        return message.channel.send(`⚔️ **DÜELLO BAŞLADI!**\n👑 Kazanan: **${kazanan}**!`);
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
    if (command === 'afk') { 
        const sebep = args.join(' ') || 'Uzakta.'; afkKullanicilar.set(userId, sebep); 
        return message.reply("💤 AFK moduna geçtin."); 
    }
    if (command === 'ship') {
        const hedef = message.mentions.users.first(); if (!hedef) return message.reply('⚠️ Kiminle aşkını ölçeceksin?');
        return message.reply(`❤️ **${message.author.username}** ile **${hedef.username}** arasındaki aşk oranı: **%${Math.floor(Math.random() * 100) + 1}** 👩‍❤️‍👨`);
    }
    if (command === 'rank') {
        const level = levelNum.get(userId) || 1; const xp = levelXP.get(userId) || 0;
        return message.reply(`📊 **Profil Durumun**:\nSeviye: **${level}**\nXP: **${xp}/${level * 100}**`);
    }
    if (command === 'avatar') {
        const kullanıcı = message.mentions.users.first() || message.author;
        return message.reply(kullanıcı.displayAvatarURL({ dynamic: true, size: 1024 }));
    }
    if (command === 'sunucubilgi') {
        return message.reply(`🏰 **Sunucu Bilgileri**:\nAdı: **${message.guild.name}**\nÜye Sayısı: **${message.guild.memberCount}**`);
    }
    
    if (command === 'temizle') {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ Yetkin yok!');
        const miktar = parseInt(args); if (!miktar || miktar < 1 || miktar > 100) return message.reply('⚠️ 1-100 arası sayı gir.');
        await message.channel.bulkDelete(miktar, true); 
        const s = await message.channel.send(`🧹 **${miktar}** mesaj silindi.`); setTimeout(() => s.delete().catch(() => {}), 3000);
    }
    if (command === 'sustur' || command === 'mute') {
        if (!message.member.permissions.has('MuteMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); const sure = parseInt(args);
        if (!hedef || !sure) return message.reply('⚠️ Kullanım: `!sustur @üye <dakika>`');
        try { 
            await hedef.timeout(sure * 60 * 1000); 
            return message.reply(`🔇 **${hedef.user.username}** ${sure} dk susturuldu.`); 
        } catch(e) { return message.reply('❌ Yetkim yetmiyor.'); }
    }
    if (command === 'uyarı' || command === 'uyar') {
        if (!message.member.permissions.has('KickMembers')) return message.reply('❌ Yetkin yok!');
        const hedef = message.guild.members.cache.get(message.mentions.users.first()?.id); if (!hedef) return message.reply('⚠️ Üye etiketle.');
        let currentUyar = uyarilar.get(hedef.id) || 0; currentUyar += 1; uyarilar.set(hedef.id, currentUyar);
        
        if (currentUyar >= 3) {
            uyarilar.set(hedef.id, 0);
            try { 
                await hedef.timeout(15 * 60 * 1000); 
                return message.channel.send(`🚨 **${hedef.user.username}** 3 uyarı nedeniyle otomatik **15 dk mute** yedi!`); 
            } catch (e) {}
        }
        return message.reply(`⚠️ **${hedef.user.username}** uyarıldı. (**${currentUyar}/3**)`);
    }
});

// --- MENÜ ETKİLEŞİM DİNLEYİCİSİ ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'yardim_menu') return;

    // values içinden gelen veriyi güvenli bir şekilde dizeye eşliyoruz
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

```
```
