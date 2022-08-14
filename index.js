import fetch from "node-fetch";
import cron from "node-cron";
import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const fetchData = async () => {
  let dates = "";

  await fetch(
    "https://registration.mfa.gov.ua/qmaticwebbooking/rest/schedule/branches/5a78cad444c63e9ad53b3f14e4049dd60c73c591361544be919e9689c4472dc3/dates;servicePublicId=2099da0454ce78dd0d10abf4113f42b9ff90d8566441acdd036a0ef027ad8fc2;customSlotLength=10"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      dates = data.length ? data.join("__") : "";
      console.log(data); // { "userId": 1, "id": 1, "title": "...", "body": "..." }
    });

  if (dates) {
    fetch(
      "https://api.telegram.org/bot5302389993%3AAAHp5CTEDs33g-YMKF7Z6sevI_nq4ehaWGE/sendMessage",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: dates,
          parse_mode: "HTML",
          disable_web_page_preview: false,
          disable_notification: false,
          reply_to_message_id: null,
          chat_id: "184527742",
        }),
      }
    );
  }
};

cron.schedule("*/30 * * * * *", function () {
  console.log("---------------------");
  console.log("Running Cron Job");
  fetchData();
});
