require('dotenv').config();
const fetch= require("node-fetch");
const Telegraf = require('telegraf');
const express = require('express')
const expressApp = express()
//server
const port = process.env.PORT || 3000
expressApp.get('/', (req, res) => {
  res.send('Hello World!')
})
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

const bot = new Telegraf(process.env.BOT_TOKEN);


async function apiData() {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=metasoccer&vs_currencies=usd&include_market_cap=true");
    const data = await response.json();
    return data;
  }
  apiData().then(data => {
    const usd = data.metasoccer.usd
    const toString= JSON.stringify(usd)
    // const marketCap= data.metasoccer.usd_market_cap active later!!
    const replace= "Gate.io"
    const msgmsgWithEscape = replace.replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)
    const usdtToken = toString.replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)
    
    // bot response

bot.start((ctx) => ctx.reply("Welcome to metasoccer, if you want to know the price of MSU please enter /price"))
    
bot.command("price",(ctx) => ctx.replyWithMarkdownV2(`MetaSoccer $MSU
💰Price $USD: ${usdtToken}
📈[Chart](https://dexscreener.com/polygon/0xd10bb4ed281a84492343573885168027cc625bf7) Dexscreen chart

Get $MSU at:
💰[Token Bonding Curve](https://msu.metasoccer.com/) $DAI pair
⛩️[${msgmsgWithEscape}](https://www.gate.io/es/trade/MSU_USDT) $USDT pair
🍣[Sushiswap](https://app.sushi.com/swap?inputCurrency=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputCurrency=0xe8377a076adabb3f9838afb77bee96eac101ffb1) $USDT pair
`, { 
  disable_web_page_preview: true 
}))


  bot.launch()

  });



  // arcane-tor-13002
  // https://arcane-tor-13002.herokuapp.com/

// "https://api.coingecko.com/api/v3/simple/price?ids=metasoccer&vs_currencies=usd%2Cmsu&include_market_cap=true"