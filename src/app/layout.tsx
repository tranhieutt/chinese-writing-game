import type { Metadata } from "next";
import { Nunito_Sans, Noto_Serif_SC } from "next/font/google";
import { ProgressProvider } from "./providers/ProgressProvider";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luyện Viết Chữ Hán v2 | Học Tiếng Trung Cổ Phong",
  description: "Trải nghiệm game luyện viết chữ Hán một trang phong cách cổ phong trầm ấm. Học tiếng Trung qua nét vẽ bút lông cổ điển, hỗ trợ HSK 1-6.",
  keywords: ["luyện viết chữ hán", "học tiếng trung", "viết chữ trung quốc", "hsk 1-6", "cổ phong"],
  authors: [{ name: "Chinese Writing Game" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${nunitoSans.variable} ${notoSerifSC.variable}`}>
      <body>
        <ProgressProvider>
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
