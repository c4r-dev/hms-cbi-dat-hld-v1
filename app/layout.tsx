import "./globals.css";
import FaviconButton from "./components/FaviconButton";

export const metadata = {
  title: "Data Selection App",
  description: "A Next.js app for selecting datasets for Training and Testing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
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
