import "./globals.css";
import FaviconButton from "./components/FaviconButton";
import Script from "next/script";

export const metadata = {
  title: "Data Holdout",
  description: "Select the data subsets for training and testing the model.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>

          {/* Google Analytics Script */}
          <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SY36J84WJG"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SY36J84WJG');
            `,
          }}
        />

        {/* Header */}
        <header className="header">
          {/* Using FaviconButton Client Component */}
          <FaviconButton />

          {/* Title container for responsive width */}
          <div className="title-container">
            <h1 className="title">
              Build a Parkinson's Disease Detector
            </h1>
          </div>
        </header>

        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
