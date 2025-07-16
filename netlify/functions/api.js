// --- Netlify Function: Product Management API ---
const { getStore } = require("@netlify/blobs");

const STORE_NAME = "manual-products";
const KEY = "all_products";

// Helper: Load existing products or return empty array
const getProducts = async () => {
  const store = getStore(STORE_NAME);
  try {
    const products = await store.get(KEY, { type: "json" });
    return Array.isArray(products) ? products : [];
  } catch (error) {
    if (error.name === "BlobNotFoundError") return [];
    throw error;
  }
};

// Helper: Save updated products array
const saveProducts = async (products) => {
  const store = getStore(STORE_NAME);
  await store.setJSON(KEY, products);
};

// --- Main Handler ---
exports.handler = async function (event) {
  const { httpMethod, queryStringParameters, body } = event;
  const action = queryStringParameters?.action;

  try {
    if (httpMethod === "GET" && action === "getProducts") {
      const products = await getProducts();
      return jsonResponse(200, { products });
    }

    if (httpMethod === "POST" && action === "addProduct") {
      if (!body) return jsonResponse(400, { error: "Missing product data" });

      const newProduct = JSON.parse(body);
      const products = await getProducts();
      products.push(newProduct);
      await saveProducts(products);

      return jsonResponse(200, { message: "Product added successfully." });
    }

    if (httpMethod === "POST" && action === "removeProduct") {
      if (!body) return jsonResponse(400, { error: "Missing product ID" });

      const { id } = JSON.parse(body);
      if (!id) return jsonResponse(400, { error: "Product ID required" });

      const products = await getProducts();
      const filtered = products.filter((p) => p.id !== id);

      await saveProducts(filtered);
      return jsonResponse(200, { message: "Product removed successfully." });
    }

    return jsonResponse(404, { error: "Unsupported action or method." });
  } catch (err) {
    console.error("[API_ERROR]", err);
    return jsonResponse(500, { error: err.message || "Internal Server Error" });
  }
};

// --- Helper: JSON Response ---
const jsonResponse = (statusCode, data) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
