import { SkillCategory } from "./types";

export const CATEGORIES: { value: SkillCategory; label: string; icon: string }[] = [
  { value: "development", label: "Development", icon: "💻" },
  { value: "devops", label: "DevOps", icon: "🚀" },
  { value: "productivity", label: "Productivity", icon: "⚡" },
  { value: "content", label: "Content", icon: "✍️" },
  { value: "data", label: "Data", icon: "📊" },
  { value: "communication", label: "Communication", icon: "💬" },
  { value: "design", label: "Design", icon: "🎨" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "other", label: "Other", icon: "📦" },
];
