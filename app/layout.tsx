import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts'
import type { Metadata } from 'next'
import { getUser } from "@/lib/auth";
import Navbar from './components/navbar';

export const metadata: Metadata = {
  title: {
    default: "Fleurir",
    template: "%s | Fleurir",
  },
};

export default async function RootLayout({children,}: {children: React.ReactNode;}) {
  const user = await getUser();
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-mist-950">
          <Navbar user={user} />
          {children}
        </div>
      </body>
    </html>
  );
}
