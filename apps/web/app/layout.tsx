'use client';

import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, BookOpen, Mail, FileCode, Menu, X } from 'lucide-react';
import WhatsAppButton from './components/WhatsAppButton';
import AIAssistant from '@/components/AIAssistant';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <html lang="en">
      <head>
        <title>Hisah Tech</title>
        <meta name="description" content="Hisah Tech - Your Tech Repair Community" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="https://app-cdn.appgen.com/c7064d62-1c73-490d-ac77-d68af9351b9e/assets/uploaded_1770778750067_te5t3k.jpeg" />
      </head>
      <body className="antialiased bg-gray-100">
        
        {/* Mobile Bottom Navigation - Primary mobile nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-pb">
          <div className="flex justify-around items-center h-14">
            <Link 
              href="/" 
              className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === '/' ? 'text-blue-600' : 'text-gray-500'}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </Link>
            
            <Link 
              href="/bios-files" 
              className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === '/bios-files' ? 'text-blue-600' : 'text-gray-500'}`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">BIOS</span>
            </Link>
            
            <Link 
              href="/schematics" 
              className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === '/schematics' ? 'text-blue-600' : 'text-gray-500'}`}
            >
              <FileCode className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Schem</span>
            </Link>
            
            <Link 
              href="/repair-guides" 
              className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === '/repair-guides' ? 'text-blue-600' : 'text-gray-500'}`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Guides</span>
            </Link>
            
            <Link 
              href="/contact" 
              className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === '/contact' ? 'text-blue-600' : 'text-gray-500'}`}
            >
              <Mail className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Contact</span>
            </Link>
          </div>
        </nav>

        <main className="pb-16 md:pb-0">{children}</main>
        
        {/* WhatsApp Floating Button */}
        <WhatsAppButton />
        
        {/* AI Assistant */}
        <AIAssistant />
      </body>
    </html>
  );
}
