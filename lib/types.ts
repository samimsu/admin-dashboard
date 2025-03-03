export interface Admin {
  id: number;
  email: string;
  password: string; // Hashed
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discount: number;
  saleEnd: string;
  createdAt: string;
}

export interface JwtPayload {
  id: number;
  email: string;
}
