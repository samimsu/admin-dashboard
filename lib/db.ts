import Database from "better-sqlite3";
import { Admin, Product } from "./types";
import path from "path";

// Initialize SQLite database
const dbPath = path.resolve(process.cwd(), "database/admin.db");
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    saleEnd TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

// Seed an admin user (for demo purposes, hash "admin123" with bcrypt beforehand)
const seedAdmin = () => {
  const adminExists = db
    .prepare("SELECT COUNT(*) as count FROM admins")
    .get() as { count: number };
  if (adminExists.count === 0) {
    const hashedPassword =
      "$2b$10$Ve28n0nJFbCt6DpC8sXJr..3l9BGMa.URiAlKX9N42IYs1/iMMG.W"; // Replace with bcrypt.hashSync('admin123', 10)
    db.prepare("INSERT INTO admins (email, password) VALUES (?, ?)").run(
      "admin@example.com",
      hashedPassword
    );
  }
};
seedAdmin();

export const getAdminByEmail = (email: string): Admin | undefined => {
  const stmt = db.prepare("SELECT * FROM admins WHERE email = ?");
  return stmt.get(email) as Admin | undefined;
};

export const getProducts = (): Product[] => {
  const stmt = db.prepare("SELECT * FROM products");
  return stmt.all() as Product[];
};

export const addProduct = (product: Product): void => {
  const stmt = db.prepare(`
    INSERT INTO products (id, name, price, discount, saleEnd, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    product.id,
    product.name,
    product.price,
    product.discount,
    product.saleEnd,
    product.createdAt
  );
};

export const updateProduct = (id: string, updates: Partial<Product>): void => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(updates);
  const stmt = db.prepare(`UPDATE products SET ${fields} WHERE id = ?`);
  stmt.run(...values, id);
};

export const deleteProduct = (id: string): void => {
  const stmt = db.prepare("DELETE FROM products WHERE id = ?");
  stmt.run(id);
};
