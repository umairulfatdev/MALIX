import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MALIX by Umair — Movies & Series",
    template: "%s | MALIX",
  },
  description:
    "Your Entertainment. One Place. Stream movies and series legally on MALIX.",
  keywords: ["streaming", "movies", "series", "MALIX"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased">
        {children}
        <Toaster
          position="top-center"
          theme="dark"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}