export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Category {
  id:string;
  name: string;
}

export interface MenuCategory extends Category {
  products: Product[];
}
