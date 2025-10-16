import "./globals.css";

export const metadata = {
  title: "OnlyZEC - Zcash Analytics",
  description: "Real-time Zcash market data and analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
