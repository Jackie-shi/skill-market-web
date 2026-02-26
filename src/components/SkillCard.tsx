import Link from "next/link";
import { Skill } from "@/lib/types";
import PlatformBadge from "./PlatformBadge";
import PriceBadge from "./PriceBadge";

export default function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link
      href={`/skills/${skill.name}`}
      className="group block rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-emerald-500/50 hover:bg-gray-900 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
          {skill.displayName}
        </h3>
        <PriceBadge pricing={skill.pricing} />
      </div>

      <p className="text-sm text-gray-400 line-clamp-2 mb-4">{skill.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {skill.compatibility.platforms.slice(0, 3).map((p) => (
          <PlatformBadge key={p} platform={p} />
        ))}
        {skill.compatibility.platforms.length > 3 && (
          <span className="text-xs text-gray-500">+{skill.compatibility.platforms.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{skill.author.name}</span>
        <div className="flex items-center gap-3">
          {skill.rating != null && (
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">★</span> {skill.rating}
            </span>
          )}
          {skill.downloads != null && (
            <span>{skill.downloads.toLocaleString()} ↓</span>
          )}
        </div>
      </div>
    </Link>
  );
}
