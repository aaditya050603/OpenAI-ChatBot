import { DataAPIClient } from "@datastax/astra-db-ts";

/**
 * ✅ AstraDB connection and vector collection setup
 * Safe: uses 1000-dimension vector (Astra limit)
 */

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);
const astraDb = client.db(process.env.ASTRA_DB_API_ENDPOINT!);

export async function ensureVectorCollection(collectionName = "chatbot_memory") {
  try {
  const collections = await astraDb.listCollections();
  // `listCollections()` returns an array of collection descriptors, not an object with a `data` property.
  const exists = collections?.some((c: any) => c.name === collectionName);

    if (!exists) {
      console.log(`⚙️ Creating new 1000-dim vector collection: ${collectionName}`);
      await astraDb.createCollection(collectionName, {
        vector: { dimension: 1000, metric: "cosine" }, // ✅ Astra-safe
      });
      console.log(`✅ Vector collection "${collectionName}" created.`);
    } else {
      console.log(`✅ Vector collection "${collectionName}" already exists.`);
    }

    return astraDb.collection(collectionName);
  } catch (err) {
    console.error("❌ AstraDB vector collection error:", err);
    throw err;
  }
}

export default astraDb;
