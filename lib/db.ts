import { sql } from "@vercel/postgres";

export const db = {
  async query(query: string, params: any[]) {
    return await sql.query(query, params);
  },
  // Add other methods as needed (e.g., prepare, run)
};
