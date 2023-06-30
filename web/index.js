// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import connectDb from "./db.js";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import productsFetchAll from "./product-update.js";
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);
connectDb()
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.get("/api/products/fetch", async (_req,res) => {
  try {
    const productsData = await shopify.api.rest.Product.all({
      session : res.locals.shopify.session
    })
    res.status(200).send(productsData)
  } catch (error) {
    console.log(`Failed to process products/fetch: ${error.message}`);
  }
});
app.post('/api/product/update/tag/', async(_req,res) => {
  try {
    const productId = _req.body.key;
    const tokenData = _req.body.newtoken;
    const client = new shopify.api.clients.Graphql({
      session : res.locals.shopify.session
    })
    const metafieldData = await client
    const result = await client.query({
      data: `mutation {
        productUpdate(
        input : {
          id: ${JSON.stringify(productId)},
          metafields: [
            {
              namespace: "token",
              key: "tokenxava",
              value: ${JSON.stringify(tokenData)},
              type: "single_line_text_field",
            }
          ]
        }) {
          product {
            metafields(first: 100) {
              edges {
                node {
                  namespace
                  key
                  value
                }
              }
            }
          }
        }
      }`,
    });
    // console.log(result.body.data.productUpdate.product)
    res.status(200).send({messgae : true,data : result.body})
  } catch (error) {
    console.log(`Failed to process products/fetch: ${error.message}`);
  }
})


app.get('/api/product/:id', async (_req,res) => {
  const productId = _req.params.id;
  const client = new shopify.api.clients.Graphql({
    session : res.locals.shopify.session
  })
  // const result = 
})

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
