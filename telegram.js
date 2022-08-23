import TelegramBot from "node-telegram-bot-api";

const checkDates = "Перевірити вільні дати (паспорт до 18 років)";

export const botInit = () => {
  const buttons = {
    reply_markup: {
      resize_keyboard: true,
      keyboard: [
        [
          {
            text: checkDates,
            callback_data: "check_dates",
          },
        ],
      ],
    },
  };

  // replace the value below with the Telegram token you receive from @BotFather
  const token = "5302389993:AAHp5CTEDs33g-YMKF7Z6sevI_nq4ehaWGE";

  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, { polling: true });

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    // send a message to the chat acknowledging receipt of their message
    if (msg.text === "/start") {
      bot.sendMessage(chatId, "Виберіть опцію: ", buttons);
    }

    console.log(msg);
    console.log("TESXTT", msg.text);

    if (msg.text === checkDates) {
      bot.sendMessage(chatId, "Перевірка... ");
    }
  });
};
