import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts'
import type { Metadata } from 'next'
import { getUser } from "@/lib/auth";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { LanguageProvider } from "@/lib/i18n/client";
import Navbar from './components/navbar';

export const metadata: Metadata = {
  title: {
    default: "Fleurir",
    template: "%s | Fleurir",
  },
};

export default async function RootLayout({children,}: {children: React.ReactNode;}) {
  const [user, locale] = await Promise.all([
    getUser(),
    getLocale(),
  ]);

  const dictionary = getDictionary(locale);

  return (
    <html lang={locale}>
      <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"/>
      </head>
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider initialLocale={locale} initialDictionary={dictionary}>
          <div className="min-h-screen bg-(--bg-base) text-(--text-primary) transition-colors duration-300">
            <Navbar user={user} />
            {children}
            <footer className="w-full py-6 text-center text-xs text-neutral-500">
              <p>
                {dictionary.footer.builtBy} · {" "}
                <a
                  href="https://github.com/KabukzDev/fleurir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-300 hover:underline"
                >
                  {dictionary.footer.sourceCode} · {" "}
                </a>
                <a
                  href="mailto:frederickcastro456@icloud.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-300 hover:underline"
                >
                  {dictionary.footer.supportLabel}
                </a>
              </p>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
