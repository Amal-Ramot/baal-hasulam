const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const HUNDREDS = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
export function heNum(n: number): string {
  let s = HUNDREDS[Math.floor(n / 100) % 10];
  n %= 100;
  if (n === 15) return s + 'טו';
  if (n === 16) return s + 'טז';
  return s + TENS[Math.floor(n / 10)] + ONES[n % 10];
}
