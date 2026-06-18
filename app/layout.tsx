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
      <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"/>
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-mist-950">
          <Navbar user={user} />
          {children}
          <footer>
            <p className="text-white/50 text-xs text-center py-6">
              This is a beta release of Fleurir. Please report any bugs or issues through the <a href="mailto:frederickc2104@gmail.com?subject=Fleurir%20Feedback" className="underline">developer's email</a>.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
