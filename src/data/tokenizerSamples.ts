// src/data/tokenizerSamples.ts
// Real tokenizations produced with the `gpt-tokenizer` package (v2), which
// ships OpenAI's published encodings: r50k_base (GPT-2 / GPT-3),
// cl100k_base (GPT-3.5 / GPT-4) and o200k_base (GPT-4o and later).
// An empty string marks a token that holds only part of a multi-byte character.
// Regenerate with: encode(text) → ids.map(id => decode([id])).

export type EncodingId = 'r50k' | 'cl100k' | 'o200k';

export const ENCODINGS: Record<EncodingId, { name: string; usedBy: string; vocab: string }> = {
    r50k: { name: 'r50k_base', usedBy: 'GPT-2, GPT-3', vocab: '50,257' },
    cl100k: { name: 'cl100k_base', usedBy: 'GPT-3.5, GPT-4', vocab: '≈100,000' },
    o200k: { name: 'o200k_base', usedBy: 'GPT-4o and later', vocab: '≈200,000' },
};

export interface TokenizerSample {
    label: string;
    text: string;
    tokens: Record<EncodingId, string[]>;
}

export const TOKENIZER_SAMPLES: TokenizerSample[] = [
    {
        label: "Common words",
        text: "Hello world",
        tokens: {
            r50k: ["Hello", " world"],
            cl100k: ["Hello", " world"],
            o200k: ["Hello", " world"],
        },
    },
    {
        label: "A longer word",
        text: "tokenization",
        tokens: {
            r50k: ["token", "ization"],
            cl100k: ["token", "ization"],
            o200k: ["token", "ization"],
        },
    },
    {
        label: "A sentence",
        text: "The cat sat on the mat.",
        tokens: {
            r50k: ["The", " cat", " sat", " on", " the", " mat", "."],
            cl100k: ["The", " cat", " sat", " on", " the", " mat", "."],
            o200k: ["The", " cat", " sat", " on", " the", " mat", "."],
        },
    },
    {
        label: "A newer word",
        text: "ChatGPT is amazing",
        tokens: {
            r50k: ["Chat", "G", "PT", " is", " amazing"],
            cl100k: ["Chat", "G", "PT", " is", " amazing"],
            o200k: ["Chat", "GPT", " is", " amazing"],
        },
    },
    {
        label: "A rare word",
        text: "unbelievably",
        tokens: {
            r50k: ["un", "bel", "iev", "ably"],
            cl100k: ["un", "belie", "vably"],
            o200k: ["un", "bel", "ievably"],
        },
    },
    {
        label: "Numbers",
        text: "12345 + 67890 = 80235",
        tokens: {
            r50k: ["123", "45", " +", " 6", "78", "90", " =", " 80", "235"],
            cl100k: ["123", "45", " +", " ", "678", "90", " =", " ", "802", "35"],
            o200k: ["123", "45", " +", " ", "678", "90", " =", " ", "802", "35"],
        },
    },
    {
        label: "Code",
        text: "def add(a, b):\n    return a + b",
        tokens: {
            r50k: ["def", " add", "(", "a", ",", " b", "):", "\n", " ", " ", " ", " return", " a", " +", " b"],
            cl100k: ["def", " add", "(a", ",", " b", "):\n", "   ", " return", " a", " +", " b"],
            o200k: ["def", " add", "(a", ",", " b", "):\n", "   ", " return", " a", " +", " b"],
        },
    },
    {
        label: "Hindi",
        text: "नमस्ते दुनिया",
        tokens: {
            r50k: ["", "न", "", "म", "", "स", "", "्", "", "त", "", "े", " ", "द", "", "ु", "", "न", "", "ि", "", "य", "ा"],
            cl100k: ["न", "म", "स", "्", "त", "े", " ", "द", "ु", "न", "ि", "य", "ा"],
            o200k: ["न", "म", "स", "्त", "े", " द", "ुन", "िय", "ा"],
        },
    },
    {
        label: "Japanese",
        text: "こんにちは世界",
        tokens: {
            r50k: ["こ", "ん", "に", "", "ち", "は", "", "世", "", "界"],
            cl100k: ["こんにちは", "", "世", "界"],
            o200k: ["こんにちは", "世界"],
        },
    },
    {
        label: "German",
        text: "Straße",
        tokens: {
            r50k: ["Stra", "ß", "e"],
            cl100k: ["Stra", "ße"],
            o200k: ["Stra", "ße"],
        },
    },
];
