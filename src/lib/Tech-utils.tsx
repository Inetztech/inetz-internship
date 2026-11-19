export type TechStack =
  | "MERN"
  | "Java"
  | "Python"
  | "DataScience"
  | "DataAnalytics"
  | "Embedded"
  | "ml"
  | "deeplearning"
  | "ai"
  | string;

interface BrandInfo {
  color: string;
}

export const BRAND_DATA: Record<string, BrandInfo> = {
  python: { color: "#3776AB" },
  django: { color: "#092E20" },
  postgresql: { color: "#4169E1" },
  docker: { color: "#2496ED" },
  aws: { color: "#FF9900" },
  react: { color: "#61DAFB" },
  nodejs: { color: "#339933" },
  mongodb: { color: "#47A248" },
  javascript: { color: "#F7DF1E" },
  typescript: { color: "#3178C6" },
  git: { color: "#F05032" },
  html5: { color: "#E34F26" },
  css3: { color: "#1572B6" },
  tensorflow: { color: "#FF6F00" },
  pandas: { color: "#150458" },
  numpy: { color: "#013243" },
  express: { color: "#000000" },
  java: { color: "#ED8B00" },
  spring: { color: "#6DB33F" },
  powerbi: { color: "#F2C811" },
  excel: { color: "#217346" },
  c: { color: "#A8B9CC" },
  cpp: { color: "#00599C" },
  "spring-boot": { color: "#6DB33F" },
  mysql: { color: "#4479A1" },
  hibernate: { color: "#59666C" },
  tomcat: { color: "#F8DC75" },
  maven: { color: "#C71A36" },
  intellij: { color: "#000000" },
  postman: { color: "#FF6C37" },
  pytorch: { color: "#EE4C2C" },
  opencv: { color: "#5C3EE8" },
  cuda: { color: "#76B900" },
  "scikit-learn": { color: "#F7931E" },
  matplotlib: { color: "#11557C" },
  linux: { color: "#FCC624" },
  firebase: { color: "#FFCA28" },
  google: { color: "#4285F4" },
  facebook: { color: "#1877F2" },
  canva: { color: "#00C4CC" },
  wordpress: { color: "#21759B" },
  linkedin: { color: "#0A66C2" },
  slack: { color: "#4A154B" },
  notion: { color: "#111111" },
  rag: { color: "#10A37F" },
  aiautomation: { color: "#7C3AED" },
};

export const DEVICON_MAP: Record<string, string> = {
  // Web & MERN
  react: "devicon-react-original",
  nodejs: "devicon-nodejs-plain",
  mongodb: "devicon-mongodb-plain",
  express: "devicon-express-original",
  javascript: "devicon-javascript-plain",
  typescript: "devicon-typescript-plain",
  html5: "devicon-html5-plain",
  css3: "devicon-css3-plain",
  nextjs: "devicon-nextjs-plain",

  // Java & Backend
  java: "devicon-java-plain",
  spring: "devicon-spring-plain",
  "spring-boot": "devicon-spring-plain",
  mysql: "devicon-mysql-plain",
  postgresql: "devicon-postgresql-plain",
  hibernate: "devicon-hibernate-plain",
  tomcat: "devicon-tomcat-line",
  maven: "devicon-maven-plain",
  intellij: "devicon-intellij-plain",
  postman: "devicon-postman-plain",

  // Python & Data Science & ML
  python: "devicon-python-plain",
  django: "devicon-django-plain",
  flask: "devicon-flask-original",
  pandas: "devicon-pandas-plain",
  numpy: "devicon-numpy-plain",
  tensorflow: "devicon-tensorflow-line",
  pytorch: "devicon-pytorch-original",
  "scikit-learn": "devicon-scikitlearn-plain",
  matplotlib: "devicon-matplotlib-plain",
  opencv: "devicon-opencv-plain",
  cuda: "devicon-cuda-plain",

  // Cloud & DevOps & Embedded
  docker: "devicon-docker-plain",
  aws: "devicon-amazonwebservices-original",
  git: "devicon-git-plain",
  linux: "devicon-linux-plain",
  c: "devicon-c-plain",
  cpp: "devicon-cplusplus-plain",
  firebase: "devicon-firebase-plain",
  google: "devicon-google-plain",
  facebook: "devicon-facebook-plain",
  canva: "devicon-canva-original",
  wordpress: "devicon-wordpress-plain",
  linkedin: "devicon-linkedin-plain",
  slack: "devicon-slack-plain",
  notion: "devicon-notion-plain",
  rag: "devicon-python-plain",
  aiautomation: "devicon-python-plain",
};

export const STACK_MAPPING: Record<string, string[]> = {
  python: ["python", "django", "postgresql", "docker", "aws"],
  mern: ["react", "nodejs", "mongodb", "javascript", "git"],
  java: ["java", "spring", "postgresql", "docker", "git"],
  datascience: ["python", "tensorflow", "pandas", "numpy", "git"],
  dataanalytics: ["python", "pandas", "numpy", "postgresql", "mysql"],
  embedded: ["c", "cpp", "python", "git"],
  default: ["html5", "css3", "javascript", "react"],
  ml: ["python", "scikit-learn", "pandas", "numpy", "matplotlib", "postgresql"],
  deeplearning: ["python", "pytorch", "tensorflow", "opencv", "cuda", "docker"],
  ai: ["python", "pytorch", "tensorflow", "docker", "git"],
  javascript: ["javascript", "react", "nodejs", "html5", "css3"],
  react: ["react", "javascript", "typescript", "html5", "css3"],
  digital: ["google", "facebook", "canva", "wordpress"],
  human: ["linkedin", "slack", "notion", "excel"],
  rag: ["python", "docker", "aws", "git"],
  aiautomation: ["python", "postgresql", "mysql", "google"],
};

export const MARKET_INSIGHTS: Record<string, { demand: string; trend: string }> = {
  python: { demand: "Critical", trend: "AI & Automation" },
  mern: { demand: "High", trend: "SaaS & Scalability" },
  java: { demand: "Stable", trend: "Enterprise FinTech" },
  datascience: { demand: "High", trend: "Machine Learning" },
  dataanalytics: { demand: "Rising", trend: "Business Intelligence" },
  embedded: { demand: "Niche", trend: "IoT & Robotics" },
  default: { demand: "Rising", trend: "Modern Web" },
  ml: { demand: "Critical", trend: "Predictive Analytics & Automation" },
  deeplearning: { demand: "High", trend: "Computer Vision & Advanced Robotics" },
  ai: { demand: "Explosive", trend: "Generative AI & Agentic Workflows" },
  javascript: { demand: "High", trend: "Reliability & Scalable Production" },
  edge_ai: { demand: "Rising", trend: "IoT & On-Device Intelligence" },
  digital: { demand: "Rising", trend: "Digital Growth" },
  digitalmarketing: { demand: "Rising", trend: "Digital Growth" },
  human: { demand: "Stable", trend: "People Operations" },
  humanresources: { demand: "Stable", trend: "People Operations" },
  rag: { demand: "Explosive", trend: "Generative AI & Retrieval" },
  aiautomation: { demand: "Explosive", trend: "AI Workflow Automation" },
};

export const getStackLogos = (stack: TechStack | string): string[] => {
  const key = String(stack).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (key.startsWith("digital")) return STACK_MAPPING.digital;
  if (key.startsWith("human") || key === "hr") return STACK_MAPPING.human;
  return STACK_MAPPING[key] || STACK_MAPPING[String(stack).toLowerCase()] || STACK_MAPPING["default"];
};

export const getIconClass = (name: string): string => {
  const key = name.toLowerCase().trim();
  return DEVICON_MAP[key] || `devicon-${key}-plain`;
};
