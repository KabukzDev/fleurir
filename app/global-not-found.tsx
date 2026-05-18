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
      <body className={`${inter.className} antialiased bg-mist-950 flex flex-col items-center justify-center min-h-screen text-center gap-4`}>
        <h1 className="text-5xl text-flower-blue">The thing you're looking for does not exist.</h1>
        <a href="/" className="text-xl rounded-md px-6 py-1 bg-flower-blue text-white transition">
          Go back to Fleurir
        </a>
      </body>
    </html>
  )
}