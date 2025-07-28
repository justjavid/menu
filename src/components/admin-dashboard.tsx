'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { Category, Product, MenuCategory } from '@/types';
import {
  addCategory,
  deleteCategory,
  addProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Edit, Utensils } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State for forms
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');

  // State for editing product
  const [editingProduct, setEditingProduct] = useState<
    (Product & { categoryId: string }) | null
  >(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');

  // Dialog open states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));
      const unsubscribe = onSnapshot(categoriesQuery, async (querySnapshot) => {
        setIsLoadingData(true);
        const categoriesData: MenuCategory[] = [];
        for (const docSnap of querySnapshot.docs) {
          const category = { id: docSnap.id, ...docSnap.data() } as Category;
          const productsQuery = query(collection(db, 'categories', category.id, 'products'), orderBy('name'));
          const productsSnapshot = await onSnapshot(productsQuery, (productsQuerySnapshot) => {
            const products: Product[] = [];
            productsQuerySnapshot.forEach((productDoc) => {
              products.push({ id: productDoc.id, ...productDoc.data() } as Product);
            });
            
            const existingCategoryIndex = categoriesData.findIndex(c => c.id === category.id);
            if (existingCategoryIndex !== -1) {
              categoriesData[existingCategoryIndex].products = products;
            } else {
              categoriesData.push({ ...category, products });
            }
            categoriesData.sort((a,b) => a.name.localeCompare(b.name));
            setMenu([...categoriesData]);
          });
        }
        setIsLoadingData(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || isLoadingData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addCategory(newCategoryName);
      toast({ title: 'Success', description: 'Category added.' });
      setNewCategoryName('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add category.' });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast({ title: 'Success', description: 'Category deleted.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete category.' });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice || !newProductCategory) return;
    try {
      await addProduct(newProductCategory, { name: newProductName, price: parseFloat(newProductPrice) });
      toast({ title: 'Success', description: 'Product added.' });
      setNewProductName('');
      setNewProductPrice('');
      setNewProductCategory('');
      setIsAddProductOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add product.' });
    }
  };
  
  const handleEditProduct = (product: Product, categoryId: string) => {
    setEditingProduct({ ...product, categoryId });
    setEditProductName(product.name);
    setEditProductPrice(String(product.price));
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.categoryId, editingProduct.id, {
        name: editProductName,
        price: parseFloat(editProductPrice),
      });
      toast({ title: 'Success', description: 'Product updated.' });
      setIsEditProductOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update product.' });
    }
  };

  const handleDeleteProduct = async (categoryId: string, productId: string) => {
    try {
      await deleteProduct(categoryId, productId);
      toast({ title: 'Success', description: 'Product deleted.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete product.' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold mb-6 font-headline">Admin Dashboard</h1>

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3">
          <TabsTrigger value="products">Manage Products</TabsTrigger>
          <TabsTrigger value="categories">Manage Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Product</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                        <div>
                          <label htmlFor="category">Category</label>
                           <Select onValueChange={setNewProductCategory} value={newProductCategory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {menu.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                        </div>
                        <div>
                          <label htmlFor="productName">Product Name</label>
                          <Input id="productName" value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="e.g. Espresso" />
                        </div>
                        <div>
                          <label htmlFor="price">Price</label>
                          <Input id="price" type="number" step="0.01" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} placeholder="e.g. 3.50" />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                          <Button type="submit">Add Product</Button>
                        </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
              {menu.map((category) => (
                <div key={category.id}>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Utensils className="h-5 w-5 text-primary"/>{category.name}</h3>
                   <ul className="space-y-2">
                    {category.products.map((product) => (
                      <li key={product.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div>{product.name} - <span className="font-bold text-primary">${product.price.toFixed(2)}</span></div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditProduct(product, category.id)}><Edit className="h-4 w-4" /></Button>
                           <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product "{product.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProduct(category.id, product.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </li>
                    ))}
                    {category.products.length === 0 && <p className="text-sm text-muted-foreground p-2">No products in this category.</p>}
                   </ul>
                </div>
              ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                  <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category name" />
                  <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
                </form>
                <ul className="space-y-2">
                {menu.map(c => c.id && c.name && (
                  <li key={c.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    {c.name}
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the "{c.name}" category and all products within it. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(c.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                ))}
                </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label htmlFor="editProductName">Product Name</label>
                <Input id="editProductName" value={editProductName} onChange={e => setEditProductName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="editPrice">Price</label>
                <Input id="editPrice" type="number" step="0.01" value={editProductPrice} onChange={e => setEditProductPrice(e.target.value)} />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
