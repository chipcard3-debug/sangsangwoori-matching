import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "상상우리 - 시니어 일자리 매칭",
  description: "시니어와 일자리를 자동으로 연결하는 상상우리 매칭 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.className} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b-2 border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-blue-700 tracking-tight">
              상상우리
            </Link>
            <nav className="flex gap-2">
              <Link
                href="/register"
                className="px-5 py-3 text-lg font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                프로필 등록
              </Link>
              <Link
                href="/recommendations"
                className="px-5 py-3 text-lg font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                추천 목록
              </Link>
              <Link
                href="/admin"
                className="px-5 py-3 text-lg font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                관리자
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
          {children}
        </main>
        <footer className="bg-white border-t-2 border-gray-200 py-6 text-center text-gray-500 text-base">
          © 2026 상상우리. 시니어 일자리 매칭 시스템.
        </footer>
      </body>
    </html>
  );
}
