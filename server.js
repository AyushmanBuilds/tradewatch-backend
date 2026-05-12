require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());

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
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });

    const result = response.data.chart.result[0];
    const meta = result.meta;

    res.json({
      symbol,
      price: meta.regularMarketPrice,
      prev: meta.previousClose,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      open: meta.regularMarketOpen
    });

  } catch (err) {

    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: "Failed to fetch stock data"
    });

  }

});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});