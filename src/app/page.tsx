import { getMenu } from '@/lib/firestore';
import type { MenuCategory } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Utensils, Coffee, Wine, CakeSlice } from 'lucide-react';
import Header from '@/components/header';

const iconMap: { [key: string]: React.ReactNode } = {
  default: <Utensils className="h-6 w-6" />,
  beverages: <Coffee className="h-6 w-6" />,
  drinks: <Wine className="h-6 w-6" />,
  desserts: <CakeSlice className="h-6 w-6" />,
};

const getCategoryIcon = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();
  for (const key in iconMap) {
    if (lowerCaseName.includes(key)) {
      return iconMap[key];
    }
  }
  return iconMap.default;
};

export default async function MenuPage() {
  const menu = await getMenu();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 lg:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter font-headline text-primary">
            Our Menu
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Fresh ingredients, bold flavors. Explore our culinary creations.
          </p>
        </div>

        {menu.length === 0 ? (
           <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">The menu is currently being updated. Please check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-12">
            {menu.map((category: MenuCategory) => (
              <section key={category.id} id={category.name.toLowerCase()}>
                <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-3xl font-headline">
                      {getCategoryIcon(category.name)}
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {category.products.length > 0 ? (
                        category.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex justify-between items-baseline py-2 border-b border-dashed border-border"
                          >
                            <p className="text-lg font-medium text-card-foreground">
                              {product.name}
                            </p>
                            <p className="text-lg font-semibold text-primary">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic md:col-span-2">
                          No items in this category yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>
        )}
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Zesty Menu &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export const revalidate = 0;
