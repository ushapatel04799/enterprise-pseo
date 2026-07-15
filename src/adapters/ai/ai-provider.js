/**
 * Abstract Base Class for hot-swappable AI Providers.
 * Ensures consistent inputs, outputs, error handling, and performance tracing.
 */
export class AiProvider {
  /**
   * Generates content based on structured prompts.
   * @param {string} systemPrompt - System-level prompt containing guidelines.
   * @param {string} userPrompt - User-level instructions.
   * @param {string} modelName - Model name.
   * @param {Record<string, any>} [options] - Generation configurations (MIME type, temperature, etc.).
   * @returns {Promise<Record<string, any>>} Standard response payload.
   */
  async generate(systemPrompt, userPrompt, modelName, options = {}) {
    throw new Error('AiProvider.generate must be implemented by child adapter.');
  }

  /**
   * Helper to estimate costs based on token count.
   * @protected
   */
  calculateCost(modelName, inputTokens, outputTokens) {
    const modelLower = modelName.toLowerCase();
    
    // Cost presets per 1K tokens
    let inputPrice = 0.00015; // default low cost
    let outputPrice = 0.0006;

    if (modelLower.includes('gemini-2.5-pro')) {
      inputPrice = 0.00125;
      outputPrice = 0.00375;
    } else if (modelLower.includes('gemini-2.5-flash')) {
      inputPrice = 0.000075;
      outputPrice = 0.0003;
    } else if (modelLower.includes('gpt-4o-mini')) {
      inputPrice = 0.00015;
      outputPrice = 0.0006;
    } else if (modelLower.includes('gpt-4o')) {
      inputPrice = 0.005;
      outputPrice = 0.015;
    } else if (modelLower.includes('claude-3-5-sonnet')) {
      inputPrice = 0.003;
      outputPrice = 0.015;
    }

    const inputCost = (inputTokens / 1000) * inputPrice;
    const outputCost = (outputTokens / 1000) * outputPrice;

    return parseFloat((inputCost + outputCost).toFixed(6));
  }
}
