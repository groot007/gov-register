import fetch from "node-fetch";
import cron from "node-cron";
import express from "express";
import path from "path";
import TelegramBot from "node-telegram-bot-api";
import e from "express";
import http from "http";

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.resolve();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

setInterval(function () {
  http.get("http://gov-register.herokuapp.com");
}, 300000); // every 5 minutes (300000)

const checkDates = "Перевірити вільні дати (паспорт до 18 років)";
const stopFetching = "Зупинити пошук дат";

const buttonCheck = {
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

const stopFetchingButton = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [
        {
          text: stopFetching,
          callback_data: "check_later",
        },
      ],
    ],
  },
};

const token = "5302389993:AAHp5CTEDs33g-YMKF7Z6sevI_nq4ehaWGE";
const bot = new TelegramBot(token, { polling: true });
let chatId = undefined;

const fetchData = async (isCron) => {
  return await fetch(
    "https://registration.mfa.gov.ua/qmaticwebbooking/rest/schedule/branches/5a78cad444c63e9ad53b3f14e4049dd60c73c591361544be919e9689c4472dc3/dates;servicePublicId=2099da0454ce78dd0d10abf4113f42b9ff90d8566441acdd036a0ef027ad8fc2;customSlotLength=10"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      const dates = data.length ? data.map((el) => el.date).join(". ") : "";

      if (dates && chatId) {
        bot.sendMessage(chatId, "Доступні дати " + dates);
        bot.sendMessage(
          chatId,
          "Зареєстурйтесь тут \n<a href='https://registration.mfa.gov.ua/qmaticwebbooking/#/'>https://registration.mfa.gov.ua</a>",
          { parse_mode: "HTML" }
        );
      }

      if (!dates && chatId && !isCron) {
        bot.sendMessage(
          chatId,
          "Нажаль доступних дат немає - ми повідомимо про нові дати",
          stopFetchingButton
        );
      }
    });
};

const fetching = cron.schedule("*/20 * * * * *", function () {
  console.log("---------------------");
  console.log("Running Cron Job");
  fetchData(isCron);
});

bot.on("message", (msg) => {
  chatId = msg.chat.id;

  if (msg.text === "/start") {
    bot.sendMessage(chatId, "Виберіть опцію: ", buttonCheck);
  }

  if (msg.text === checkDates) {
    fetchData();
  }

  if (msg.text === stopFetching) {
    bot.sendMessage(
      chatId,
      "Пошук дат припинено \nвиберіть дію для продовження...",
      buttonCheck
    );
    fetching.stop();
  }
});
