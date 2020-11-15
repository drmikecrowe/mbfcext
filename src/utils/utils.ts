export function toM(num) {
  if (num > 1000000) {
    return `${Math.round(num / 1000000)}M`;
  }
  if (num > 1000) {
    return `${Math.round(num / 1000)}K`;
  }
  return num;
}
