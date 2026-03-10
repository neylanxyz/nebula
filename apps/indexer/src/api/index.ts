import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";

const app = new Hono();

app.use("/sql/*", client({ db, schema }));

app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

/**
 * REST endpoint that returns all indexed deposits sorted by leafIndex.
 * Used by nebula-avalanche SDK to avoid eth_getLogs rate limits.
 *
 * Response: { deposits: { commitment: string, leafIndex: number }[] }
 */
app.get("/deposits", async (c) => {
  const rows = await db.select().from(schema.depositEvent);

  const deposits = rows
    .map((row) => ({
      commitment: row.commitment,
      leafIndex: row.leafIndex,
    }))
    .sort((a, b) => a.leafIndex - b.leafIndex);

  return c.json({ deposits });
});

export default app;
