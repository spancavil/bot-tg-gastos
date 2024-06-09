import dotenv from "dotenv"
dotenv.config()
import googleCredentials from "./docs/bot-telegram-test-425720-b3c9c293ca45.json" assert { type: "json" }
import telegramBot from "node-telegram-bot-api"
import { google } from "googleapis"

const token = process.env.TELEGRAM_BOT_TOKEN
const spreadsheetId = process.env.GOOGLE_SHEET_ID

const bot = new telegramBot(token, {
  polling: true,
  request: {
    agentOptions: {
      keepAlive: true,
      family: 4,
    },
  },
})

const initGooglesheet = async () => {
    try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: googleCredentials.client_email,
            private_key: googleCredentials.private_key,
          },
          scopes: "https://www.googleapis.com/auth/spreadsheets",
        })
      
        const client = await auth.getClient()
        const sheet = google.sheets({ version: "v4", auth: client })
      
        return sheet
    } catch (error) {
        console.log('Error on init');
        console.log(error);
    }
}

bot.on("message", async (incomingMessage) => {
  const chatId = incomingMessage.chat.id
  const text = incomingMessage.text.trim()
  let [amount, category] = text.split(" ")

  if (amount.includes("/")) {
    const numbers = amount.split("/")
    amount = numbers[0] / numbers[1]
  }

  category = category ?? "General"

  try {
    const sheet = await initGooglesheet()
    console.log({sheet});
    const dataAppend = await sheet.spreadsheets.values.append({
      spreadsheetId,
      range: "Hoja1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[category, amount]],
      },
      insertDataOption: "INSERT_ROWS", //add rows
    })

    bot.sendMessage(chatId, "Gasto registrado.")
  } catch (error) {
    console.log({errorSendingMessage: error})
    bot.sendMessage(`No se pudo registrar el gasto. Error: ${error.message}`)
  }
})

console.log("Bot running...")
