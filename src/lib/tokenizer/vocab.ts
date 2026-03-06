// src/lib/tokenizer/vocab.ts
// Demo vocabulary (~500 tokens) for the AI Beacon LLM Visualizer
// Token IDs are 1-indexed (0 is reserved for <UNK>)

export const VOCAB_SIZE = 512;
export const UNK_ID = 0;
export const UNK_TOKEN = '<unk>';

/**
 * Demo vocabulary: ~500 common English words plus special tokens.
 * Index 0 = <unk> (unknown token)
 */
export const VOCAB: string[] = [
    // Special tokens
    '<unk>',      // 0

    // Common function words
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',        // 1-10
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', // 11-20
    'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used',              // 21-28
    'and', 'or', 'but', 'nor', 'for', 'yet', 'so',                               // 29-35
    'in', 'on', 'at', 'by', 'from', 'to', 'of', 'with', 'about', 'above',       // 36-45
    'below', 'between', 'into', 'through', 'during', 'before', 'after',           // 46-52
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',            // 53-62
    'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',                    // 63-70
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose',   // 71-79
    'not', 'no', 'never', 'always', 'often', 'sometimes', 'usually', 'very',     // 80-87
    'just', 'also', 'too', 'only', 'even', 'still', 'already', 'yet', 'soon',   // 88-96
    'if', 'then', 'because', 'although', 'while', 'when', 'where', 'how', 'why', // 97-105

    // Common nouns
    'time', 'year', 'people', 'way', 'day', 'man', 'woman', 'child', 'world',   // 106-114
    'life', 'hand', 'part', 'place', 'case', 'week', 'company', 'system',        // 115-122
    'program', 'question', 'government', 'number', 'night', 'point', 'home',     // 123-129
    'water', 'room', 'mother', 'area', 'money', 'story', 'fact', 'month',       // 130-137
    'lot', 'right', 'study', 'book', 'eye', 'job', 'word', 'business', 'issue', // 138-146
    'side', 'kind', 'head', 'house', 'service', 'friend', 'father', 'power',    // 147-154
    'hour', 'game', 'line', 'air', 'morning', 'place', 'member', 'city',        // 155-162
    'community', 'name', 'president', 'team', 'minute', 'idea', 'body', 'back', // 163-170
    'information', 'school', 'group', 'problem', 'hand', 'family', 'change',    // 171-177
    'action', 'car', 'street', 'door', 'floor', 'table', 'window', 'food',      // 178-185
    'tree', 'river', 'ocean', 'mountain', 'sky', 'sun', 'moon', 'star', 'earth', // 186-194

    // Common verbs
    'say', 'get', 'make', 'go', 'know', 'take', 'see', 'come', 'think', 'look', // 195-204
    'want', 'give', 'use', 'find', 'tell', 'ask', 'seem', 'feel', 'try', 'leave', // 205-214
    'call', 'keep', 'let', 'begin', 'show', 'hear', 'play', 'run', 'move', 'live', // 215-224
    'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand',   // 225-232
    'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change',     // 233-240
    'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', // 241-248
    'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love',        // 249-256
    'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect',      // 257-264
    'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest',       // 265-272
    'raise', 'pass', 'sell', 'require', 'report', 'decide', 'pull', 'add',      // 273-280

    // Common adjectives
    'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'old',   // 281-289
    'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early',    // 290-297
    'young', 'important', 'public', 'private', 'real', 'best', 'free', 'true', // 298-305
    'hard', 'possible', 'human', 'sure', 'clear', 'full', 'open', 'strong',    // 306-313
    'white', 'black', 'dark', 'light', 'close', 'simple', 'short', 'wide',     // 314-321
    'beautiful', 'happy', 'sad', 'fast', 'slow', 'hot', 'cold', 'warm', 'cool', // 322-330
    'deep', 'low', 'empty', 'heavy', 'rich', 'poor', 'safe', 'kind', 'smart',  // 331-339
    'quiet', 'loud', 'soft', 'hard', 'easy', 'difficult', 'common', 'special', // 340-347

    // AI / tech / math vocabulary (domain-relevant for the visualizer)
    'model', 'token', 'embedding', 'attention', 'weight', 'matrix', 'vector',   // 348-354
    'layer', 'neural', 'network', 'transformer', 'language', 'prediction',      // 355-360
    'probability', 'distribution', 'softmax', 'gradient', 'training', 'loss',  // 361-366
    'input', 'output', 'hidden', 'dimension', 'head', 'context', 'sequence',   // 367-373
    'data', 'parameter', 'function', 'algorithm', 'compute', 'generate',       // 374-379
    'encode', 'decode', 'predict', 'classify', 'learn', 'optimize', 'normalize', // 380-386
    'query', 'key', 'value', 'score', 'mask', 'position', 'encoding',         // 387-393
    'feed', 'forward', 'residual', 'normalization', 'activation', 'sampling',  // 394-399
    'greedy', 'temperature', 'logit', 'vocab', 'depth', 'width', 'size',       // 400-406

    // Numbers as words
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', // 407-416
    'hundred', 'thousand', 'million', 'billion', 'zero', 'half', 'third',       // 417-423
    'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh',         // 424-430

    // Additional common words to reach ~500
    'about', 'across', 'again', 'ago', 'along', 'already', 'also', 'always',  // 431-438
    'around', 'away', 'back', 'behind', 'both', 'each', 'enough', 'every',    // 439-446
    'everyone', 'everything', 'few', 'gone', 'here', 'however', 'however',    // 447-453
    'less', 'more', 'most', 'much', 'neither', 'none', 'nothing', 'now',      // 454-461
    'once', 'other', 'others', 'out', 'own', 'rather', 'same', 'several',     // 462-469
    'since', 'some', 'such', 'than', 'then', 'there', 'therefore', 'though',  // 470-477
    'together', 'towards', 'under', 'until', 'upon', 'whether', 'without',    // 478-484
    'cat', 'dog', 'bird', 'fish', 'horse', 'cow', 'lion', 'tiger', 'bear',    // 485-493
    'apple', 'orange', 'banana', 'coffee', 'music', 'art', 'science', 'math', // 494-501
    'hello', 'world', 'love', 'peace', 'hope', 'dream', 'future', 'past',     // 502-509
    'today', 'tomorrow', 'yesterday',                                           // 510-512
];

// Trim to exactly VOCAB_SIZE entries
const _trimmedVocab = VOCAB.slice(0, VOCAB_SIZE);
// Fill up to VOCAB_SIZE if needed
while (_trimmedVocab.length < VOCAB_SIZE) {
    _trimmedVocab.push(`<tok${_trimmedVocab.length}>`);
}

export const VOCAB_LIST: string[] = _trimmedVocab;

/** Map from token string → token ID (built at module load time) */
export const TOKEN_TO_ID: Map<string, number> = new Map(
    VOCAB_LIST.map((token, idx) => [token, idx])
);

/**
 * Convert a token string to its vocabulary ID.
 * Returns UNK_ID (0) for unknown tokens.
 */
export function tokenToId(token: string): number {
    return TOKEN_TO_ID.get(token.toLowerCase()) ?? UNK_ID;
}

/**
 * Convert a vocabulary ID to the corresponding token string.
 * Returns '<unk>' for out-of-range IDs.
 */
export function idToToken(id: number): string {
    if (id < 0 || id >= VOCAB_LIST.length) return UNK_TOKEN;
    return VOCAB_LIST[id];
}

/**
 * Convert an array of token strings to their IDs.
 */
export function tokensToIds(tokens: string[]): number[] {
    return tokens.map(tokenToId);
}

/**
 * Convert an array of token IDs to token strings.
 */
export function idsToTokens(ids: number[]): string[] {
    return ids.map(idToToken);
}
