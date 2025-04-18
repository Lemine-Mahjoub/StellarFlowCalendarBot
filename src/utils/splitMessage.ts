export function splitMessage(text: string, maxLength = 2000): string[] {
  const chunks: string[] = [];
  while (text.length > maxLength) {
    const splitIndex = text.lastIndexOf("\n", maxLength);
    const index = splitIndex > 0 ? splitIndex : maxLength;
    chunks.push(text.slice(0, index));
    text = text.slice(index).trim();
  }
  if (text) chunks.push(text);
  return chunks;
}
