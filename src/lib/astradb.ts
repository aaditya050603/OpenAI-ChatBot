import { DataAPIClient } from "@datastax/astra-db-ts";

/**
 * AstraDB connection for DataStax Vector Database
 * 
 * ⚠️ Latest SDK version (v1.3.x+) does NOT accept 'namespace'
 * — it infers keyspace automatically from your token.
 */

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);

// ✅ Connect using endpoint only — DO NOT include namespace
export const astraDb = client.db(process.env.ASTRA_DB_API_ENDPOINT!);

// Optional: log once to confirm connection (can comment out later)
console.log("✅ AstraDB connected at:", process.env.ASTRA_DB_API_ENDPOINT);

export default astraDb;
