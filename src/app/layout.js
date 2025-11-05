import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import NavigationBar from "@/components/navigatiorbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CleanTheStreets - Report Urban Safety Issues",
  description: "Report and view urban safety issues like potholes and road hazards on an interactive map",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <NavigationBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
