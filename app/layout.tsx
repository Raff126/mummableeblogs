import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "MummaBeeBlog | UAE Family Life, Kids Activities & Honest Guides",
    template: "%s | MummaBeeBlog",
  },
  description: "Tested UAE family guides, weekend activities, child-friendly dining, and practical parenting advice from a mum raising two girls across Dubai and Abu Dhabi.",
  metadataBase: new URL('https://mummabeeblog.com'),
  alternates: {
    canonical: 'https://mummabeeblog.com/',
  },
  openGraph: {
    title: 'MummaBeeBlog | UAE Family Life, Kids Activities & Honest Guides',
    description: 'Tested UAE family guides, weekend activities, child-friendly dining, and practical parenting advice from a mum raising two girls across Dubai and Abu Dhabi.',
    url: 'https://mummabeeblog.com/',
    siteName: 'MummaBeeBlog',
    images: [
      {
        url: 'https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg',
        width: 1200,
        height: 630,
        alt: 'MummaBeeBlog - UAE Family Guide',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MummaBeeBlog | UAE Family Life, Kids Activities & Honest Guides',
    description: 'Tested UAE family guides, weekend activities, child-friendly dining, and practical parenting advice from a mum raising two girls across Dubai and Abu Dhabi.',
    images: ['https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/mama-logo.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/images/mama-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/mama-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/mama-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/images/mama-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/mama-logo.png" />
        {/* Guard script to prevent third-party browser extensions from popping runtime error overlays or console noise */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  var msg = (e.message || '').toLowerCase();
                  var fn = (e.filename || '').toLowerCase();
                  if (
                    fn.includes('chrome-extension://') ||
                    fn.includes('evmask') ||
                    fn.includes('inpage') ||
                    fn.includes('inject') ||
                    msg.includes('ethereum') ||
                    msg.includes('tronlink') ||
                    msg.includes('stacksprovider') ||
                    msg.includes('ronin') ||
                    msg.includes('backpack') ||
                    msg.includes('metamask') ||
                    msg.includes('cannot redefine property')
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var reason = (e.reason && (e.reason.message || e.reason.stack || JSON.stringify(e.reason))) || '';
                  var reasonStr = (typeof reason === 'string' ? reason : '').toLowerCase();
                  if (
                    reasonStr.includes('chrome-extension://') ||
                    reasonStr.includes('ethereum') ||
                    reasonStr.includes('metamask') ||
                    reasonStr.includes('json-rpc') ||
                    reasonStr.includes('-3260')
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-desert-blush selection:text-mumma-rose" suppressHydrationWarning>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
