'use strict';
const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
// Bot用情報
const config = {
  channelSecret: "ce0539b7447dd2c330125e82c17cc091",
  channelAccessToken: "Z4FGS9+Xyezf0ZukhL83iZn3ciVColl12uJkPp1sNzc13NJSjrMhY9LGI0ncpDrVm8ko1pbKFrHnKm02LpyrFditod8NnUqQkcaMd8MfERRTmgyJ/PyxiJBlQlWJBczpnbGgTkBkrlwCnvwGt4TXQgdB04t89/1O/w1cDnyilFU=",
};
const client = new line.Client(config);
// LINE Botからのアクセスの一次処理。
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});
// イベントに対する返答を記述する部分
function handleEvent(event) {
  // ユーザーからBotにテキストが送られた場合以外は何もしない
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  // ユーザーからBotにテキストが送られた場合のみ以下が実行される
  // メッセージを構築
  const echo = { type: 'text', text: "今日はバレンタインデーですね。" };
  // 返信
  return client.replyMessage(event.replyToken, echo);
}
// Webアプリケーションを開始
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});