// src/__tests__/mathEngine/embedding_pe_integration.test.ts
// Integration tests verifying EmbeddingStep and PositionalEncodingStep math correctness.
// Tests Step 7 requirements: correct tensor shapes and X_pos = X_embed + PE.

import { describe, it, expect } from 'vitest';
import { executeStep } from '@/lib/store/stepMachine';
import { PipelineStep, DEFAULT_CONFIG } from '@/lib/store/types';
import type { TensorRegistry } from '@/lib/store/types';

describe('Step 7: Embedding + Positional Encoding integration', () => {
    const config = { ...DEFAULT_CONFIG, dModel: 8 };
    const inputText = 'The cat sat';
    const temperature = 1.0;

    // Build up tensors through the pipeline sequentially
    let tensors: TensorRegistry = {};

    it('Step 1: TOKENIZE → 3 tokens', () => {
        tensors = executeStep(PipelineStep.TOKENIZE, { config, tensors, inputText, temperature });
        expect(tensors.tokens?.raw).toEqual(['the', 'cat', 'sat']);
    });

    it('Step 2: TOKEN_IDS → 3 integer IDs', () => {
        tensors = executeStep(PipelineStep.TOKEN_IDS, { config, tensors, inputText, temperature });
        expect(tensors.token_ids?.ids).toHaveLength(3);
        expect(tensors.token_ids?.ids.every((id) => Number.isInteger(id))).toBe(true);
    });

    it('Step 3 (EMBEDDING): X has shape (3, 8)', () => {
        tensors = executeStep(PipelineStep.EMBEDDING, { config, tensors, inputText, temperature });
        const X = tensors.embed!.X;
        expect(X.shape).toEqual([3, 8]);
    });

    it('Step 3 (EMBEDDING): W_e has shape (|V|, 8)', () => {
        const We = tensors.embed!.We;
        expect(We.shape[1]).toBe(8);
        expect(We.shape[0]).toBeGreaterThan(100); // vocab > 100 tokens
    });

    it('Step 3 (EMBEDDING): X has no NaN values', () => {
        const X = tensors.embed!.X;
        for (const v of Array.from(X.data)) {
            expect(Number.isFinite(v)).toBe(true);
        }
    });

    it('Step 4 (POSITIONAL_ENCODING): PE has shape (3, 8)', () => {
        tensors = executeStep(PipelineStep.POSITIONAL_ENCODING, { config, tensors, inputText, temperature });
        const PE = tensors.posenc!.PE;
        expect(PE.shape).toEqual([3, 8]);
    });

    it('Step 4 (POSITIONAL_ENCODING): X_pos has shape (3, 8)', () => {
        const X_pos = tensors.posenc!.X_pos;
        expect(X_pos.shape).toEqual([3, 8]);
    });

    it('Step 4 (POSITIONAL_ENCODING): PE[0,0] = sin(0) = 0', () => {
        const PE = tensors.posenc!.PE.toMatrix();
        // Even dimensions: sin — PE[pos=0] = sin(0) = 0 for all even dims
        expect(PE[0][0]).toBeCloseTo(0, 5);
    });

    it('Step 4 (POSITIONAL_ENCODING): PE[0,1] = cos(0) = 1', () => {
        const PE = tensors.posenc!.PE.toMatrix();
        // Odd dimensions: cos — PE[pos=0] = cos(0) = 1 for all odd dims
        expect(PE[0][1]).toBeCloseTo(1.0, 5);
    });

    it('Step 4 (POSITIONAL_ENCODING): PE[1,0] = sin(1) ≈ 0.8415', () => {
        const PE = tensors.posenc!.PE.toMatrix();
        // PE[pos=1, dim=0] = sin(1/10000^0) = sin(1)
        expect(PE[1][0]).toBeCloseTo(Math.sin(1), 5);
    });

    it('Step 4 (POSITIONAL_ENCODING): X_pos = X_embed + PE (max error < 1e-5)', () => {
        const X = tensors.embed!.X.toMatrix();
        const PE = tensors.posenc!.PE.toMatrix();
        const X_pos = tensors.posenc!.X_pos.toMatrix();

        let maxError = 0;
        for (let i = 0; i < 3; i++) {
            for (let d = 0; d < 8; d++) {
                const err = Math.abs(X[i][d] + PE[i][d] - X_pos[i][d]);
                maxError = Math.max(maxError, err);
            }
        }
        expect(maxError).toBeLessThan(1e-5);
    });

    it('Step 4 (POSITIONAL_ENCODING): X_pos has no NaN values', () => {
        const X_pos = tensors.posenc!.X_pos;
        for (const v of Array.from(X_pos.data)) {
            expect(Number.isFinite(v)).toBe(true);
        }
    });

    it('Step 4 (POSITIONAL_ENCODING): PE values are in [-1, 1] (sine/cosine bounded)', () => {
        const PE = tensors.posenc!.PE;
        for (const v of Array.from(PE.data)) {
            expect(Math.abs(v)).toBeLessThanOrEqual(1.0 + 1e-6);
        }
    });

    it('Different positions have different PE rows', () => {
        const PE = tensors.posenc!.PE.toMatrix();
        // Position 0 and position 1 should differ (except at exactly same angles, unlikely)
        const different = PE[0].some((v, d) => Math.abs(v - PE[1][d]) > 1e-4);
        expect(different).toBe(true);
    });
});
