const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Fetch products from Shopify
app.get('/api/products', async (req, res) => {
  try {
    // Replace with actual Shopify API call
    const shopifyResponse = await axios.get('https://your-shop.myshopify.com/admin/api/2023-01/products.json', {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
      },
    });
    res.json(shopifyResponse.data.products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create video task
app.post('/api/create-video', async (req, res) => {
  const { productId } = req.body;
  try {
    // Fetch product details from Shopify
    const productResponse = await axios.get(`https://your-shop.myshopify.com/admin/api/2023-01/products/${productId}.json`, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
      },
    });
    const product = productResponse.data.product;

    // Create task in database
    const result = await pool.query(
      'INSERT INTO video_tasks (product_id, status) VALUES ($1, $2) RETURNING id',
      [productId, 'pending']
    );
    const taskId = result.rows[0].id;

    // Call Stable Video Diffusion service
    const svdResponse = await axios.post('https://stable-video-diffusion-service.com/create', {
      task_id: taskId,
      image_urls: product.images.map(img => img.src),
      callback_url: `${process.env.APP_URL}/api/video-callback`,
    });

    res.json({ message: 'Video creation task initiated', taskId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create video task' });
  }
});

// Video creation callback
app.post('/api/video-callback', async (req, res) => {
  const { task_id, video_url, thumbnail_url } = req.body;
  try {
    // Update task in database
    await pool.query(
      'UPDATE video_tasks SET status = $1, video_url = $2, thumbnail_url = $3 WHERE id = $4',
      ['completed', video_url, thumbnail_url, task_id]
    );

    // Fetch product_id from the task
    const taskResult = await pool.query('SELECT product_id FROM video_tasks WHERE id = $1', [task_id]);
    const productId = taskResult.rows[0].product_id;

    // Update Shopify product with video URL
    await axios.put(`https://your-shop.myshopify.com/admin/api/2023-01/products/${productId}.json`, {
      product: {
        id: productId,
        metafields: [
          { key: 'video_url', value: video_url, type: 'url' },
          { key: 'video_thumbnail_url', value: thumbnail_url, type: 'url' },
        ],
      },
    }, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
      },
    });

    res.json({ message: 'Video task completed and product updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process video callback' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});