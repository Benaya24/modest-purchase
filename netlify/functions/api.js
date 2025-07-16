const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'manual-products';

// Helper to get all products from the database
const getProducts = async () => {
    const store = getStore(STORE_NAME);
    try {
        const data = await store.get('all_products', { type: 'json' });
        return data || []; // Return an array of products
    } catch (error) {
        if (error.name === 'BlobNotFoundError') {
            return []; // If store is empty, return empty array
        }
        throw error;
    }
};

exports.handler = async function(event) {
    const { action } = event.queryStringParameters;
    
    try {
        if (event.httpMethod === 'GET' && action === 'getProducts') {
            const products = await getProducts();
            return { statusCode: 200, body: JSON.stringify({ products }) };
        }

        if (event.httpMethod === 'POST' && action === 'addProduct') {
            const newProduct = JSON.parse(event.body);
            const products = await getProducts();
            products.push(newProduct);
            await getStore(STORE_NAME).setJSON('all_products', products);
            return { statusCode: 200, body: JSON.stringify({ message: 'Product added.' }) };
        }

        if (event.httpMethod === 'POST' && action === 'removeProduct') {
            const { id } = JSON.parse(event.body);
            let products = await getProducts();
            products = products.filter(p => p.id !== id);
            await getStore(STORE_NAME).setJSON('all_products', products);
            return { statusCode: 200, body: JSON.stringify({ message: 'Product removed.' }) };
        }
        
        return { statusCode: 404, body: 'Action not found.' };

    } catch (error) {
        console.error("[FUNCTION_ERROR]", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
