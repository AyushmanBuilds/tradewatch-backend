const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Allow frontend requests
app.use(cors({
  origin: "https://tradewatch-frontend.netlify.app"
}));

// Health route
app.get("/", (req, res) => {
  res.send("TradeWatch backend running");
});

// Quote route
app.get("/quote", async (req, res) => {

  try {

    const symbol = req.query.symbol;

    if (!symbol) {
      return res.status(400).json({
        error: "Symbol required"
      });
    }

    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept":
          "application/json,text/plain,*/*",
        "Referer":
          "https://finance.yahoo.com/"
      },
      timeout: 10000
    });

    const result = response.data?.chart?.result?.[0];

    if (!result || !result.meta) {
      return res.status(404).json({
        error: "Invalid symbol or no data found"
      });
    }

    const meta = result.meta;

    res.json({
      symbol,
      price: meta.regularMarketPrice,
      prev: meta.previousClose,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      open: meta.regularMarketOpen,
      volume: meta.regularMarketVolume,
      currency: meta.currency,
      exchange: meta.exchangeName,
      marketState: meta.marketState,
      updated: Date.now()
    });

  } catch (err) {

    console.error("Yahoo Fetch Error:");
    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: "Failed to fetch stock data"
    });

  }

});

// IMPORTANT FOR RENDER
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});