require("dotenv").config();

process.env.FFMPEG_PATH = require("ffmpeg-static");

const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  ActivityType,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const app = express();
app.use(express.json());

let activeUranio = null;
let uranioId = 220;

const DAILY_LIMIT = 2;
let uranioDailyState = {
  date: new Date().toISOString().slice(0, 10),
  count: 0,
};

function canActivateUranio() {
  const today = new Date().toISOString().slice(0, 10);

  if (uranioDailyState.date !== today) {
    uranioDailyState = { date: today, count: 0 };
  }

  if (uranioDailyState.count >= DAILY_LIMIT) {
    return false;
  }

  return true;
}

function markUranioActivated() {
  const today = new Date().toISOString().slice(0, 10);

  if (uranioDailyState.date !== today) {
    uranioDailyState = { date: today, count: 0 };
  }

  uranioDailyState.count += 1;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function getRealPnl(payload = {}) {
  return {
    pnlPct: payload.pnlPct ?? +(Math.random() * 3 + 0.4).toFixed(2),
    pnlUsd: payload.pnlUsd ?? +(Math.random() * 250 + 80).toFixed(2),
  };
}

async function cleanOldUranioChannels(guild) {
  const channels = guild.channels.cache.filter(
    (c) =>
      c.type === ChannelType.GuildVoice &&
      (c.name.includes("URANIO") || c.name.includes("Uranio"))
  );

  for (const channel of channels.values()) {
    await channel.delete().catch(() => {});
  }
}


function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scheduleNextAutomaticUranio() {
  const delayMinutes = randomBetween(180, 720); // 3 a 12 horas
  const delayMs = delayMinutes * 60 * 1000;

  console.log(`Next automatic Uranio check in ${delayMinutes} minutes`);

  setTimeout(async () => {
    try {
      if (canActivateUranio() && !activeUranio) {
        await startUranioEvent({
          fast: false,
          pnlPct: +(Math.random() * 3 + 0.4).toFixed(2),
          pnlUsd: +(Math.random() * 350 + 100).toFixed(2),
        });
      }
    } catch (error) {
      console.error("Automatic Uranio failed:", error.message);
    } finally {
      scheduleNextAutomaticUranio();
    }
  }, delayMs);
}

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("uranio")
      .setDescription("Control Uranio Protocol")
      .addSubcommand((cmd) =>
        cmd.setName("demo").setDescription("Run Uranio demo")
      )
      .addSubcommand((cmd) =>
        cmd.setName("stop").setDescription("Stop active Uranio event")
      )
      .toJSON(),
  ];

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
    { body: commands }
  );

  console.log("Slash commands registered");
}

async function startUranioEvent(payload = {}) {
  if (activeUranio) throw new Error("Uranio Protocol is already active.");

  if (!canActivateUranio()) {
    throw new Error("Daily Uranio limit reached. Max 2 activations per day.");
  }

  markUranioActivated();

  uranioId += 1;

  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const textChannel = await guild.channels.fetch(process.env.LOG_CHANNEL_ID);

  // Voice/audio disabled. Uranio now runs only as a live text execution log.
  const voiceChannel = null;
  const connection = null;
  const player = null;

  const me = await guild.members.fetchMe();
  await me.setNickname("☢️ URANIO CORE").catch(() => {});

  client.user.setPresence({
    activities: [{ name: `Uranio #${uranioId}`, type: ActivityType.Watching }],
    status: "dnd",
  });

  activeUranio = {
    uranioId,
    guild,
    textChannel,
    voiceChannel,
    connection,
    player,
    me,
    payload,
    stopped: false,
  };

  await textChannel.send(`
@everyone

────────────────────────────
☢️ **URANIO PROTOCOL #${uranioId}**

Institutional anomaly detected.

Scanning global liquidity...
AI allocation engine engaged.

Status: **EXECUTING**
────────────────────────────
`);

  const logs = [
    "☢️ Whale cluster detected...",
    "☢️ Cross-exchange liquidity imbalance confirmed.",
    "☢️ AI confidence: 31%",
    "☢️ Hidden liquidity pocket identified.",
    "☢️ AI confidence: 47%",
    "☢️ Institutional capital routing...",
    "☢️ AI confidence: 63%",
    "☢️ Darkpool synchronized.",
    "☢️ AI confidence: 81%",
    "☢️ Derivatives imbalance detected.",
    "☢️ AI confidence: 94%",
    "☢️ EXECUTION LOCKED",
    "☢️ Calculating execution...",
    "☢️ Verifying fills...",
    "☢️ Closing institutional orders...",
  ];

  for (const log of logs) {
    if (!activeUranio || activeUranio.stopped) return;
    const delay = payload.fast ? 4000 : Math.floor(Math.random() * 6000) + 6000;
    await wait(delay);
    await textChannel.send(log).catch(() => {});
  }

  await wait(payload.fast ? 10000 : Math.floor(Math.random() * 240000) + 420000);

  if (!activeUranio || activeUranio.stopped) return;

  await completeUranioEvent(payload.outcome === "WIN");
}

async function completeUranioEvent(auto = false) {
  if (!activeUranio) throw new Error("No Uranio event is active.");

  const { textChannel, voiceChannel, connection, player, me, uranioId, payload } =
    activeUranio;

  activeUranio.stopped = true;

  await textChannel.send("☢️ **Execution closed. Calculating final result...**");

  await wait(auto ? 5000 : 10000);

  const result = await getRealPnl(payload);

  await textChannel.send(`
☢️ **URANIO #${uranioId} COMPLETE**

Result:
**+${result.pnlPct}%**

Profit:
**+$${result.pnlUsd}**

Status:
**Capital secured**

Core offline.
`);

  if (player) player.stop();
  if (connection) connection.destroy();

  await wait(5000);

  await voiceChannel.delete().catch(() => {});
  await me.setNickname("Bullions AI").catch(() => {});

  client.user.setPresence({
    activities: [{ name: "Idle", type: ActivityType.Watching }],
    status: "online",
  });

  activeUranio = null;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "uranio") return;

  const subcommand = interaction.options.getSubcommand();

  try {
    if (subcommand === "demo") {
      await interaction.reply({
        content: "☢️ Anomaly detected. Opening Uranio Core...",
        ephemeral: true,
      });

      await startUranioEvent({ fast: true });
    }

    if (subcommand === "stop") {
      await interaction.reply({
        content: "☢️ Closing active Uranio Protocol...",
        ephemeral: true,
      });

      await completeUranioEvent(false);
    }
  } catch (error) {
    await interaction.reply({
      content: `⚠️ ${error.message}`,
      ephemeral: true,
    }).catch(() => {});
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true, bot: client.user?.tag || null });
});

app.post("/uranio/activate", async (req, res) => {
  console.log("POST /uranio/activate", req.body);
  try {
    const secret = req.headers["x-bullions-secret"];

    if (secret !== process.env.DISCORD_API_SECRET) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    startUranioEvent(req.body || {}).catch((error) => {
      console.error("Uranio event failed:", error);
    });

    res.json({ ok: true, message: "Uranio activation started" });
    return;
  } catch (error) {
    console.error("Uranio activation failed:", error);
    res.status(400).json({ ok: false, error: error.message });
  }
});

client.once("clientReady", async () => {
  console.log(`Bullions Discord bot online as ${client.user.tag}`);
  await registerCommands();
  scheduleNextAutomaticUranio();

  app.listen(process.env.PORT || 3007, () => {
    console.log(`Discord Uranio API running on port ${process.env.PORT || 3007}`);
  });
});

client.login(process.env.DISCORD_TOKEN);
