import { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blogs & Events | iNetz Technologies",
  description: "Stay updated with the latest from iNetz Technologies. Read about our student projects, Java, Python, and MERN stack internships, technical workshops, tech achievements, and life at our Chennai campus.",
  keywords: "Java Training Chennai, MERN Stack Internship, Python Courses, DevOps Training, Software Engineering Internships, Tech Projects, Student Achievements, UI/UX Design Workshop, Tech Internships Chennai, Web Development Bootcamps",
  openGraph: {
    title: "Blogs & Events | iNetz Technologies",
    description: "Stay updated with the latest from iNetz Technologies. Read about our student projects, Java, Python, and MERN stack internships.",
    url: "https://inetztech.com/blog",
    siteName: "iNetz Technologies",
    images: [
      {
        url: "https://inetztech.com/logo.png",
        width: 1200,
        height: 630,
        alt: "iNetz Technologies Blog",
      }
    ],
    locale: "en_IN",
    type: "website",
  }
};

export default function BlogPage() {
  return <BlogClient />;
}
