const fetch = require("node-fetch");
const crypto = require("crypto");
const { getStore } = require("@netlify/blobs");

// --- CONFIGURATION ---
const APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;
const TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID;
const API_ENDPOINT = "https://eco.taobao.com/router/rest";
const PRODUCTS_STORE_NAME = "curated-products";

// --- HELPER FUNCTIONS ---

// **FIXED: Explicitly provide siteID for authentication**
const getProductsStore = () =>
  getStore({ name: PRODUCTS_STORE_NAME, siteID: process.env.SITE_ID });

const getCuratedProducts = async () => {
  const store = getProductsStore();
  try {
    const data = await store.get("all", { type: "json" });
    return data || { men: [], women: [], children: [], gifts: [] };
  } catch (error) {
    if (error.name === "BlobNotFoundError") {
      return { men: [], women: [], children: [], gifts: [] };
    }
    throw error;
  }
};

function createSignature(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  let signString = "";
  for (const key of sortedKeys) {
    signString += key + params[key];
  }
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(signString);
  return hmac.digest("hex").toUpperCase();
}

// --- MAIN HANDLER ---
exports.handler = async function (event) {
  const { action } = event.queryStringParameters;

  // Basic check for API keys to provide a clear error
  if (!APP_KEY || !APP_SECRET || !TRACKING_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "Server configuration error: Missing API keys or Tracking ID in environment variables.",
      }),
    };
  }

  try {
    if (event.httpMethod === "GET" && action === "getProducts") {
      const products = await getCuratedProducts();
      return { statusCode: 200, body: JSON.stringify(products) };
    }

    if (event.httpMethod === "POST" && action === "addProduct") {
      const { productId, category } = JSON.parse(event.body);
      const products = await getCuratedProducts();
      if (!products[category]) products[category] = [];
      if (!products[category].includes(productId)) {
        products[category].push(productId);
      }
      await getProductsStore().setJSON("all", products);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Product added." }),
      };
    }

    if (event.httpMethod === "POST" && action === "removeProduct") {
      const { productId, category } = JSON.parse(event.body);
      const products = await getCuratedProducts();
      if (products[category]) {
        products[category] = products[category].filter(
          (id) => id !== productId
        );
      }
      await getProductsStore().setJSON("all", products);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Product removed." }),
      };
    }

    if (event.httpMethod === "POST" && action === "getProductDetails") {
      const { productIds } = JSON.parse(event.body);
      if (!productIds || productIds.length === 0)
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "No product IDs" }),
        };

      const params = {
        app_key: APP_KEY,
        sign_method: "hmac",
        method: "aliexpress.affiliate.productdetail.get",
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
        partner_id: "cainiao",
        fields:
          "product_id,product_title,target_sale_price,product_main_image_url,discount,evaluate_rate,original_price,promotion_link",
        product_ids: productIds.join(","),
        target_language: "HE",
        target_currency: "ILS",
        tracking_id: TRACKING_ID,
      };
      params.sign = createSignature(params, APP_SECRET);

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        body: new URLSearchParams(params).toString(),
      });
      const data = await response.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    return { statusCode: 404, body: "Action not found or wrong HTTP method." };
  } catch (error) {
    console.error("[FUNCTION_ERROR]", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
