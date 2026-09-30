import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";
import Providers from "./providers";

const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });

const WhatsAppButton = dynamic(
  () =>
    import("@/components/WhatsAppButton").then(
      (mod) => mod.WhatsAppButton
    )
);

export const metadata: Metadata = {
  metadataBase: new URL("https://inetztech.com"),
  title: {
    default:
      "Inetz Technologies | Best Internship Training in Chennai with Placement",
    template: "%s | Inetz Technologies",
  },
  description:
    "Top-rated Internship training in Chennai. Get placement ready with Full stack training, MERN stack, Java, AI, and Data Science internships at Inetz Technologies.",
  keywords: [
    "Internship training in Chennai",
    "Full stack training Chennai",
    "MERN stack internship",
    "Java full stack course Chennai",
    "AI internship Chennai",
    "Data science internship Chennai",
    "Placement training Chennai",
    "Software training  in Chennai",
    "Inetz Technologies",
    "Best internship with placement Chennai",
    "internship in chennai for students",
    "software internship in chennai",
    "internship companies in chennai",
    "vadapalani internship company",
    "best software training  in chennai",
    "1 month internship in chennai for students",
    "it companies in chennai for internship",
    "internship in chennai for freshers",
    "internship in vadapalani",
    "best internship companies in chennai",
    "free 1 month internship in chennai for students",
    "it internship in chennai",
    "internship providing companies in chennai",
    "internship near me",
    "it companies in vadapalani",
    "hadoop training in chennai",
    "embedded systems internship chennai",
    "software developer internship in chennai",
    "best it training  in chennai",
    "internship training in coimbatore",
    "iot training  in chennai",
    "python internship in chennai",
    "ui ux course in chennai",
    "mern stack internship chennai",
    "java developer internship chennai",
    "full stack developer internship chennai",
    "best placement support  in chennai",
    "15 days internship in chennai for college students",
    "it companies in chennai for internship for students",
    "best it training  in chennai with placement",
    "it startup companies in chennai",
    "software companies in vadapalani",
    "best company for internship in chennai",
    "internship for science students in chennai",
    "hr internship in chennai",
    "bio internship opportunity in chennai",
    "data science course in chennai",
    "java selenium training in chennai",
  ],
  authors: [{ name: "Inetz Technologies" }],
  creator: "Inetz Technologies",
  publisher: "Inetz Technologies",
  alternates: {
    canonical: "https://inetztech.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://inetztech.com",
    siteName: "Inetz Technologies",
    title: "Inetz Technologies | Best Internship Training in Chennai",
    description:
      "Accelerate your tech career with expert-led training, real-world internships, and guaranteed placement support at Inetz Technologies.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Inetz Technologies Chennai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inetz Technologies | Best Internship Training in Chennai",
    description:
      "Accelerate your tech career with expert-led training, real-world internships, and guaranteed placement support.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 font-sans">
        {/* NextAuth context sits at the absolute top of the body execution stack */}
        <Providers>
          <ThemeProvider forcedTheme="light">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
            <Toaster position="top-center" richColors />

            {/* Combined Organization & Local Business Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "Organization",
                      "@id": "https://inetztech.com/#organization",
                      "name": "Inetz Technologies",
                      "url": "https://inetztech.com",
                      "logo": "https://inetztech.com/logo.png",
                      "sameAs": [
                        "https://www.linkedin.com/company/inetztech",
                        "https://www.facebook.com/inetztech",
                        "https://www.instagram.com/inetztech",
                        "https://www.youtube.com/@inetztech",
                      ],
                    },
                    {
                      "@type": "EducationalOrganization",
                      "name": "Inetz Technologies",
                      "description":
                        "Provider of the best internships in Chennai with a focus on Full Stack Development and Placement.",
                      "address": {
                        "@type": "PostalAddress",
                        "addressLocality": "Chennai",
                        "addressRegion": "TN",
                        "postalCode": "600001",
                        "addressCountry": "IN",
                      },
                      "telephone": "+91-9840234475",
                      "url": "https://inetztech.com",
                      "image": "https://inetztech.com/logo.png",
                    },
                  ],
                }),
              }}
            />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}