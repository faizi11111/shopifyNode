const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = process.env.SHOPIFY_SCOPES;
const forwardingAddress = process.env.FORWARDING_ADDRESS;
const shopifyDomain = process.env.SHOPIFY_DOMAIN;

//https://quickstart-4c7437e7.myshopify.com/admin/oauth/authorize?client_id=60bbec07d8fd0f1efcb86051ceab9fcc&scope=read_orders,write_orders,read_products,write_products&redirect_uri=https://f5hlot-ip-104-28-162-139.tunnelmole.net/shopify/callback

app.get('/shopify', (req, res) => {
  const shop = req.query.shop;
  if (shop) {
    const redirectUri = `${forwardingAddress}/shopify/callback`;
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}`;
    res.redirect(installUrl);
  } else {
    return res.status(400).send('Missing shop parameter.');
  }
});

app.get('/shopify/callback', async (req, res) => {
  const { shop, hmac, code } = req.query;
  if (shop && hmac && code) {
    console.log('Authorization code:', code);

    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    };

    try {
      const response = await axios.post(accessTokenRequestUrl, accessTokenPayload);
      const accessToken = response.data.access_token;
      console.log('Access token:', accessToken);
      res.send(`Access token: ${accessToken}`);
    } catch (error) {
      console.error('Error obtaining access token:', error);
      res.status(500).send('Error obtaining access token');
    }
  } else {
    res.status(400).send('Required parameters missing');
  }
});

app.listen(3000, () => {
  console.log(shopifyDomain, apiKey, apiSecret, scopes, forwardingAddress);
  console.log('App is running on port 3000');
});