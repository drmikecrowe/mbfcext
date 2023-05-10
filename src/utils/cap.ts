export const cap = (s: string) =>
  s
    .split(/[-/]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
