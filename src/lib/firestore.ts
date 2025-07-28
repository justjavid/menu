import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  writeBatch,
  getDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category, MenuCategory, Product } from '@/types';

const CATEGORIES_COLLECTION = 'categories';
const PRODUCTS_COLLECTION = 'products';

// Function to get the full menu
export async function getMenu(): Promise<MenuCategory[]> {
  const categoriesQuery = query(collection(db, CATEGORIES_COLLECTION), orderBy("name"));
  const categorySnapshot = await getDocs(categoriesQuery);
  const menu: MenuCategory[] = [];

  for (const categoryDoc of categorySnapshot.docs) {
    const categoryData = categoryDoc.data() as Category;
    const category: MenuCategory = {
      id: categoryDoc.id,
      name: categoryData.name,
      products: [],
    };

    const productsQuery = query(collection(db, CATEGORIES_COLLECTION, categoryDoc.id, PRODUCTS_COLLECTION), orderBy("name"));
    const productsSnapshot = await getDocs(productsQuery);
    productsSnapshot.forEach((productDoc) => {
      category.products.push({ id: productDoc.id, ...productDoc.data() } as Product);
    });
    menu.push(category);
  }

  return menu;
}

// Function to add a new category
export async function addCategory(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { name });
  return docRef.id;
}

// Function to delete a category and all its products
export async function deleteCategory(categoryId: string): Promise<void> {
    const categoryDocRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    const productsCollectionRef = collection(categoryDocRef, PRODUCTS_COLLECTION);
    
    // Get all products to delete them in a batch
    const productsSnapshot = await getDocs(productsCollectionRef);
    
    const batch = writeBatch(db);

    productsSnapshot.docs.forEach((productDoc) => {
        batch.delete(productDoc.ref);
    });

    // Delete the category itself
    batch.delete(categoryDocRef);

    await batch.commit();
}

// Function to add a product to a category
export async function addProduct(categoryId: string, product: Omit<Product, 'id'>): Promise<string> {
  const categoryDocRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  const productsCollectionRef = collection(categoryDocRef, PRODUCTS_COLLECTION);
  const docRef = await addDoc(productsCollectionRef, product);
  return docRef.id;
}

// Function to update a product
export async function updateProduct(categoryId: string, productId: string, productData: Partial<Product>): Promise<void> {
  const productDocRef = doc(db, CATEGORIES_COLLECTION, categoryId, PRODUCTS_COLLECTION, productId);
  await updateDoc(productDocRef, productData);
}

// Function to delete a product
export async function deleteProduct(categoryId: string, productId: string): Promise<void> {
  const productDocRef = doc(db, CATEGORIES_COLLECTION, categoryId, PRODUCTS_COLLECTION, productId);
  await deleteDoc(productDocRef);
}
