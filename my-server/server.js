// ייבוא ספריות נדרשות
const express = require("express");
const fetch = require("node-fetch");
const crypto = require("crypto");
const path = require("path");
const cors = require("cors"); // שימוש ב-CORS מהקוד שלך
require("dotenv").config(); // טעינת משתני סביבה מהקובץ .env

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================================
// == טוען את המפתחות מקובץ .env - הדרך המאובטחת שלך ==
const API_KEY = process.env.ALIEXPRESS_APP_KEY;
const API_SECRET = process.env.ALIEXPRESS_APP_SECRET;
// ==========================================================

// הפעלת CORS והגשת קבצים סטטיים
app.use(cors());
app.use(express.static(path.join(__dirname, "..", "Web site")));

// פונקציה ליצירת החתימה הדיגיטלית (MD5)
const signRequest = (parameters) => {
  const sortedParams = Object.keys(parameters)
    .sort()
    .reduce((acc, key) => {
      acc[key] = parameters[key];
      return acc;
    }, {});
  const sortedString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}${value}`)
    .join("");
  const bookstandString = `${API_SECRET}${sortedString}${API_SECRET}`;
  return crypto
    .createHash("md5")
    .update(bookstandString, "utf8")
    .digest("hex")
    .toUpperCase();
};

// נקודת הקצה לקבלת מוצרים
app.get("/api/products", async (req, res) => {
  // בדיקה אם המפתחות נטענו בהצלחה
  if (!API_KEY || !API_SECRET) {
    return res
      .status(500)
      .json({ error: "API keys are not configured correctly on the server." });
  }

  const keywords = req.query.keywords || "smart watch";

  const payload = {
    method: "aliexpress.affiliate.product.query",
    app_key: API_KEY,
    sign_method: "md5",
    timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
    format: "json",
    v: "2.0",
    keywords: keywords,
    target_currency: "ILS",
    target_language: "EN",
    page_no: "1",
  };

  const sign = signRequest(payload);
  const allParams = { ...payload, sign };

  try {
    const aliExpressResponse = await fetch(
      "http://gw.api.taobao.com/router/rest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: new URLSearchParams(allParams),
      }
    );

    const data = await aliExpressResponse.json();
    const products =
      data.aliexpress_affiliate_product_query_response?.resp_result?.result
        ?.products?.product || [];
    res.json(products);
  } catch (error) {
    console.error("Error communicating with AliExpress:", error);
    res.status(500).json({ error: "Failed to fetch products from AliExpress" });
  }
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
