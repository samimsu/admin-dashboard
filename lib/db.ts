import { QueryResultRow, sql } from "@vercel/postgres";
import { Product } from "./types";

export const db = {
  async query<T extends QueryResultRow = Product>(
    query: string,
    params: (string | number | boolean | null | Date | Buffer)[]
  ) {
    return await sql.query<T>(query, params);
  },
};
