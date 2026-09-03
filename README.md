# 🔊 24/7 Discord Voice Channel (AFK) Bot

This project ensures a bot **stays connected 24/7** to a specific voice channel on your Discord server, maintaining an **AFK (Away From Keyboard) status**. It is optimized to run on completely free cloud platforms (Render, Square Cloud, etc.) and utilizes the latest `discord.js v14` framework.

---

## 🔒 Security Note
The bot's **secret token** (password) is not hardcoded into the script. Your token remains secure even if the project is **Public**. You must add the token information securely via the hosting platform's (e.g., Render) **Environment Variables** section using the key `DISCORD_TOKEN`.

---

## 🚀 Setup and Execution

### 1. File Configuration
Open `index.js` and fill in the following lines with your specific server details:
* **`SES_KANAL_ID`**: The ID of the voice channel where the bot will remain 24/7.
* **`SUNUCU_ID`**: The ID of the Discord server where the bot will be located.

### 2. Required Libraries
To ensure the project's audio streaming and connectivity function correctly, the `package.json` file includes the following dependencies:
* 'discord.js'
* '@discordjs/voice'
* 'libsodium-crypto-wrapper'
* 'ffmpeg-static'
* '@discordjs/opus'

### 3. Deploying on Render.com
1. Log in to [Render.com](https://render.com) using your GitHub account.
2. Follow the steps **New +** -> **Web Service** to import this repository. 3. In the settings, set the **Build Command** to `npm install` and the **Start Command** to `npm start`.
4. Go to the **Environment Variables** section:
   * **Key:** `DISCORD_TOKEN`
   * **Value:** The Bot Token obtained from the Discord Developer Portal.
5. Select the **Free Plan** at the bottom and click the **Deploy Web Service** button.

---

## 📜 License & Acknowledgments
This project is completely open-source. You are free to improve it, use it on your servers, or share it with others!
