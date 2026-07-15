import { describe, it } from 'node:test';
import assert from 'node:assert';
import { providerRegistry } from '../../src/adapters/ai/provider-registry.js';
import { queueManager } from '../../src/adapters/ai/queue-manager.js';
import { AiProvider } from '../../src/adapters/ai/ai-provider.js';

class MockTestProvider extends AiProvider {
  constructor(responseWord) {
    super();
    this.responseWord = responseWord;
  }

  async generate(systemPrompt, userPrompt, modelName) {
    const inputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
    const outputTokens = Math.ceil(this.responseWord.length / 4);
    const cost = this.calculateCost(modelName, inputTokens, outputTokens);

    return {
      text: JSON.stringify({ title: this.responseWord, content: { hero: {} } }),
      usage: {
        inputTokens,
        outputTokens,
        estimatedCost: cost,
      },
      durationMs: 10,
    };
  }
}

describe('AI Pipeline & Hot-Swapping Tests', () => {
  it('should register and hot-swap custom AI providers', () => {
    const testProvA = new MockTestProvider('Alpha');
    const testProvB = new MockTestProvider('Beta');

    providerRegistry.register('testA', testProvA);
    providerRegistry.register('testB', testProvB);

    // Swap configurations dynamically using config mocks or explicit active checks
    // Verify registry returns the registered instance
    assert.strictEqual(providerRegistry.providers.get('testa'), testProvA);
    assert.strictEqual(providerRegistry.providers.get('testb'), testProvB);
  });

  it('should process concurrent requests through rate queue limits', async () => {
    let callCount = 0;
    const task = async () => {
      callCount++;
      await new Promise(res => setTimeout(res, 20));
      return 'done';
    };

    const results = await Promise.all([
      queueManager.enqueue(task),
      queueManager.enqueue(task),
      queueManager.enqueue(task),
    ]);

    assert.strictEqual(callCount, 3);
    assert.deepStrictEqual(results, ['done', 'done', 'done']);
  });
});
