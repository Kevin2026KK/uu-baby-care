export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  if (hours < 24) {
    return remainMinutes > 0 ? `${hours}小时${remainMinutes}分前` : `${hours}小时前`;
  }

  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function isToday(timestamp: number): boolean {
  const now = new Date();
  const d = new Date(timestamp);
  return now.toDateString() === d.toDateString();
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  if (isToday(timestamp)) return "今天";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "昨天";

  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
