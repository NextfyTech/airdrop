import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

export default async function productsFetchAll (session){
    const client = new shopify.api.clients.Graphql({ session });
    try {
      const result = await client.query({
        data: `
        mutation updateProductTags($productId: ID!, $tags: [String!]!) {
          productUpdate(input: { id: $productId, tags: $tags }) {
            product {
              id
              tags
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      });
      const { edges } = result.body.data.products;
      return edges;
    } catch (error){
      if (error instanceof GraphqlQueryError) {
        throw new Error(
          `${error.message}\n${JSON.stringify(error.response, null, 2)}`
        );
      } else {
        throw error;
      }
    }
  }