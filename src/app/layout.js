import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "SkillMap - Personal Skill Gap Navigator",
  description:
    "Enter your learning goal and what you already know. SkillMap identifies your exact missing prerequisite skills and generates a personalized day-by-day plan to close the gap.",
  keywords: "skill gap, learning plan, AI tutor, prerequisite skills, personalized learning",
  openGraph: {
    title: "SkillMap - Personal Skill Gap Navigator",
    description: "AI-powered skill gap analysis and personalized day-by-day learning plans.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
