'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const isAdminPage = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <nav>
          {user ? (
            <div className="flex items-center gap-4">
              {isAdminPage ? (
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
            </div>
          ) : (
            <Button asChild variant={pathname === '/login' ? 'outline' : 'default'}>
              <Link href="/login"><User className="mr-2 h-4 w-4" /> Admin Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
