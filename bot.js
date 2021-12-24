require('dotenv').config();
const { ethers } = require("ethers");
const fetch= require("node-fetch");
const Telegraf = require('telegraf');
const express = require('express')
const fs = require('fs');
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
const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");

const abiPath = __dirname + "/abi/";
const TCBAbi = abiPath + "BatchedBancorMarketMaker.json";
const ERC20Abi = abiPath + "MetaSoccerToken.json";

async function apiData() {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=metasoccer&vs_currencies=usd&include_market_cap=true");
    const data = await response.json();
    const curve = new ethers.Contract('0xD2b2132D8E6d6484276f3D779341fA3F64a002fD' , JSON.parse(fs.readFileSync(TCBAbi)) , provider)
    const msu = new ethers.Contract('0xe8377a076adabb3f9838afb77bee96eac101ffb1' , JSON.parse(fs.readFileSync(ERC20Abi)) , provider)
    const usdt = new ethers.Contract('0xc2132d05d31c914a87c6611c10748aeb04b58e8f' , JSON.parse(fs.readFileSync(ERC20Abi)) , provider)
    const dai = new ethers.Contract('0x8f3cf7ad23cd3cadbd9735aff958023239c6a063' , JSON.parse(fs.readFileSync(ERC20Abi)) , provider)
    const sushiPool = '0xD10bB4ED281A84492343573885168027Cc625bf7'
    const sushiMsu = parseFloat(ethers.utils.formatEther(await msu.balanceOf(sushiPool)));
    const sushiUsdt = parseFloat(ethers.utils.formatUnits(await usdt.balanceOf(sushiPool), 6));
    const sushiPrice = sushiUsdt/sushiMsu;
    const curveDai = parseFloat(ethers.utils.formatEther(await dai.balanceOf(curve.address)));
    const curvePricePPM = await curve.getCollateralPricePPM("0x8f3cf7ad23cd3cadbd9735aff958023239c6a063");

    const totalSupply = parseFloat(ethers.utils.formatEther(await msu.totalSupply()));

    const rewardsPool = parseFloat(ethers.utils.formatEther(await msu.balanceOf('0x050bb0f723e4ab90C970299d99d9224Aec6948d9')));
    const ecosystemPool = parseFloat(ethers.utils.formatEther(await msu.balanceOf('0xf19EdA02E5CF627068b3Ba0Ac05D24A458E4a7De')));
    const privatePool = parseFloat(ethers.utils.formatEther(await msu.balanceOf('0x8e102df538b9d031BB48247718d1dCfB0cF71c72')));
    const publicPool = parseFloat(ethers.utils.formatEther(await msu.balanceOf('0xbE2a5865AEA0930EBFfc8FcFedf199a758c6258b')));
    const teamPool = parseFloat(ethers.utils.formatEther(await msu.balanceOf('0x5fe04126A92b9cf8147898D9193EB164DF633259')));
    const advisorsPool = parseFloat(ethers.utils.formatEther(await msu.balanceOf('0xc9e5d1982131abd8e329586fb6bbc5c1dd393953')));
    const xmsuPool = parseFloat(ethers.utils.formatEther(await msu.balanceOf('0x1ec9ab0bbb381d64eb7870ebf98b4a93437786ac')));
    const circulatingSupply = totalSupply - rewardsPool - ecosystemPool - publicPool - privatePool - teamPool - advisorsPool - xmsuPool;

    const onchainLiquidity = curveDai + sushiUsdt;
    const fullyDiluted = totalSupply * (curvePricePPM/1000000);
    const marketCap = circulatingSupply * (curvePricePPM/1000000);
    const effectiveReserveRatio = onchainLiquidity/marketCap;
    // const msu = 
    return {
      data: data,
      curvePricePPM: curvePricePPM,
      sushi: sushiPrice,
      totalSupply: totalSupply,
      circulatingSupply: circulatingSupply,
      onchainLiquidity: onchainLiquidity,
      effectiveReserveRatio: effectiveReserveRatio,
      fullyDiluted: fullyDiluted,
      marketCap: marketCap
    };
  }
  apiData().then(values => {
    data = values.data;
    const usd = data.metasoccer.usd
    const toString= JSON.stringify(usd)
    // const marketCap= data.metasoccer.usd_market_cap active later!!
    const replace= "Gate.io"
    const msgmsgWithEscape = replace.replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)
    const usdtToken = toString.replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)

    const curvePrice = (values.curvePricePPM/1000000).toFixed(6).replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)

    const sushiPrice = values.sushi.toFixed(6).replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)

    const totalSupply = values.totalSupply.toLocaleString(undefined, {maximumFractionDigits: 0}).replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)

    const circulatingSupply = values.circulatingSupply.toLocaleString(undefined, {maximumFractionDigits: 0}).replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)
    
    const fullyDiluted = values.fullyDiluted.toLocaleString(undefined, {maximumFractionDigits: 0}).replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)

    const marketCap = values.marketCap.toLocaleString(undefined, {maximumFractionDigits: 0}).replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)

    const onchainLiquidity = values.onchainLiquidity.toLocaleString(undefined, {maximumFractionDigits: 0}).replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)

    const effectiveReserveRatio = (values.effectiveReserveRatio * 100).toFixed(2).replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x)

    // bot response

    bot.start((ctx) => ctx.reply("Welcome to the MetaSoccer community price bot, if you want to know the price of MSU please enter /price. Supply info also available with /supply."))
        
    bot.command("price",(ctx) => ctx.replyWithMarkdownV2(`
MetaSoccer Price Bot

💰MSU Price:
💪[Token Bonding Curve](https://msu.metasoccer.com/) ${curvePrice} DAI
⛩️[${msgmsgWithEscape}](https://www.gate.io/es/trade/MSU_USDT) ${usdtToken} USDT
🍣[Sushiswap Polygon](https://app.sushi.com/swap?inputCurrency=0xc2132d05d31c914a87c6611c10748aeb04b58e8f&outputCurrency=0xe8377a076adabb3f9838afb77bee96eac101ffb1) ${sushiPrice} USDT

📈Sushi Charts with [Dexscreen](https://dexscreener.com/polygon/0xd10bb4ed281a84492343573885168027cc625bf7)

      `, { 
      disable_web_page_preview: true 
    }))

    bot.command("supply",(ctx) => ctx.replyWithMarkdownV2(`
MetaSoccer Price Bot

💰MSU Supply:
💸Total Supply: ${totalSupply} MSU
📉Circulating Supply: ${circulatingSupply} MSU

📈Fully Diluted Valuation: ${fullyDiluted} USD
💵Market Cap: ${marketCap} USD

🔗Onchain Liquidity: ${onchainLiquidity} USD
🔄Effective Reserve Ratio: ${effectiveReserveRatio} %
      `, { 
      disable_web_page_preview: true 
    }))

    bot.launch()

});



  // arcane-tor-13002
  // https://arcane-tor-13002.herokuapp.com/

// "https://api.coingecko.com/api/v3/simple/price?ids=metasoccer&vs_currencies=usd%2Cmsu&include_market_cap=true"