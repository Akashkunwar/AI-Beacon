// src/lib/tokenizer/wordSplit.ts
// Word-level tokenizer for the simulator: lowercases, then splits into words
// and single punctuation marks ("Hello, world!" → hello , world !).
// Real models use subword tokenizers (BPE / SentencePiece) instead.

const TOKEN_PATTERN = /[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu;

/**
 * @param text - raw input string
 * @returns     lowercase word and punctuation tokens, in order
 */
export function wordSplit(text: string): string[] {
    return text.toLowerCase().match(TOKEN_PATTERN) ?? [];
}
