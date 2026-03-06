// src/lib/tokenizer/wordSplit.ts
// Whitespace tokenizer (MVP) — splits on whitespace, lowercases

/**
 * Whitespace tokenizer.
 * Splits input on any whitespace, lowercases each token, filters empty strings.
 *
 * @param text - raw input string
 * @returns     array of lowercase word tokens
 */
export function wordSplit(text: string): string[] {
    return text
        .trim()
        .split(/\s+/)
        .map(t => t.toLowerCase())
        .filter(t => t.length > 0);
}
