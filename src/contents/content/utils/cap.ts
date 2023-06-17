export const cap = (s: string) =>
  s.split
    ? s
        .split(/[-/]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : s
