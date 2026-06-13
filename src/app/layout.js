import "../styles/globals.css";
import NavigationBar from "@/components/navigatiorbar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "CleanTheStreets - Report Urban Safety Issues",
  description: "Report and view urban safety issues like potholes and road hazards on an interactive map",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased flex flex-col min-h-screen">
        <ThemeProvider />
        <NavigationBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
