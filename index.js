'use strict';
const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
// Bot用情報
const config = {
  channelSecret: "channelSecret",
  channelAccessToken: "channelAccessToken",
};
const client = new line.Client(config);
const util = require('util'); // ☆追加
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
// イベントに対する返答を記述する部分
function handleEvent(event) {
  // ユーザーからBotにテキストが送られた場合以外は何もしない
  if (event.type !== 'message' || event.message.type !== 'location') { // ☆変更
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  // ユーザーからBotに位置情報が送られた場合のみ以下が実行される
  var request = require('sync-request');
  var url = util.format('https://map.yahooapis.jp/search/local/V1/localSearch?appid=dj00aiZpPUh6SW9WUXEyc0Z3eiZzPWNvbnN1bWVyc2VjcmV0Jng9Y2E-&lat=%s&lon=%s&dist=3&output=json', event.message.latitude, event.message.longitude);
  var res = request('GET', url);
  var result = JSON.parse(res.getBody('utf8'));
  var restaurants = result.Feature
  var eachRestaurantLayoutTemplate = {
    "type": "bubble",
    "hero": {
      "type": "image",
      "url": "https://linecorp.com",
      "size": "full",
      "aspectRatio": "2:1",
      "aspectMode": "cover"
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [{
          "type": "text",
          "text": "Name",
          "weight": "bold",
          "size": "xl"
        },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "lg",
          "spacing": "sm",
          "contents": [{
              "type": "box",
              "layout": "baseline",
              "spacing": "sm",
              "contents": [{
                  "type": "text",
                  "text": "住所",
                  "color": "#aaaaaa",
                  "size": "sm",
                  "flex": 1
                },
                {
                  "type": "text",
                  "text": "Address",
                  "wrap": true,
                  "color": "#666666",
                  "size": "sm",
                  "flex": 3
                }
              ]
            }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
        {
          "type": "button",
          "style": "link",
          "height": "sm",
          "action": {
            "type": "uri",
            "label": "経路",
            "uri": "https://linecorp.com"
          }
        },
        {
          "type": "spacer",
          "size": "sm"
        }
      ],
      "flex": 0
    }
  }
  var restaurantsLayout = []
  restaurants.forEach(function(restaurant) {
    var eachRestaurantLayout = JSON.parse(JSON.stringify(eachRestaurantLayoutTemplate));
    if(restaurant.Property.LeadImage != undefined) {
      eachRestaurantLayout.body.contents[0].text = restaurant.Name;
      eachRestaurantLayout.body.contents[1].contents[0].contents[1].text = restaurant.Property.Address;
      eachRestaurantLayout.hero.url = restaurant.Property.LeadImage.replace('http://', 'https://')
      eachRestaurantLayout.footer.contents[0].action.uri = util.format('https://www.google.com/maps?q=%s,%s', restaurant.Geometry.Coordinates.split(',')[1], restaurant.Geometry.Coordinates.split(',')[0])
      restaurantsLayout.push(eachRestaurantLayout)
    }
  });
  var carousel = {
    "type": "carousel",
    "contents": restaurantsLayout
  }
  // メッセージを構築
  const echo = {
    'type': 'flex',
    'altText': '検索結果',
    'contents': carousel
  }
  // 返信
  return client.replyMessage(event.replyToken, echo);
}
// Webアプリケーションを開始
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
