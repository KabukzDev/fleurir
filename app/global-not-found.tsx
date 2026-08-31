// Import global styles and fonts
import './ui/global.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
 
const inter = Inter({ subsets: ['latin'] })
 
export const metadata: Metadata = {
  title: 'Whoops!',
  description: 'The page you are looking for does not exist.',
}
 
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-mist-950 flex flex-col items-center justify-center min-h-screen text-center gap-4 px-4`}>
        <h1 className="text-4xl sm:text-5xl text-flower-blue font-light">The page you are looking for does not exist.</h1>
        <p className="text-white/60 text-lg">La página que buscas no existe.</p>
        <a href="/" className="text-lg rounded-xl px-6 py-2 bg-flower-blue text-white transition hover:bg-flower-blue/90 font-medium mt-4 cursor-pointer">
          Go back to Fleurir / Volver a Fleurir
        </a>
      </body>
    </html>
  )
}