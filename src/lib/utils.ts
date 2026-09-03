import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const chineseCharacterCount = (textOnly.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWordCount = textOnly
    .replace(/[\u4e00-\u9fa5]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTimeMinutes = Math.max(
    1,
    Math.ceil(chineseCharacterCount / 400 + englishWordCount / 200),
  );
  return `约 ${readingTimeMinutes} 分钟`;
}

export function parseLegacyPath(legacyPath: string) {
  const segments = legacyPath.split("/").filter(Boolean);
  if (segments.length < 4) {
    throw new Error(`Invalid legacyPath: ${legacyPath}`);
  }

  const [year, month, day, ...slugParts] = segments;
  return {
    year,
    month,
    day,
    slug: slugParts.join("/"),
  };
}
