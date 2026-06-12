import fs from 'fs';

export function parseCsvFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf-8').trim();
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const headers = lines.shift().split(',').map(header => header.trim());
  return lines.filter(Boolean).map(line => {
    const values = line.split(',').map(value => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}
