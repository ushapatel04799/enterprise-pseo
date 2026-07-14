import { promptBuilder } from './prompt-builder.js';
import { geminiAdapter } from '../adapters/ai/gemini-adapter.js';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';
import { configManager } from '../core/config-manager.js';

/**
 * Writer Engine managing content generation orchestration.
 */
class WriterEngine {
  /**
   * Generates localized content models for a page.
   * @param {Record<string, any>} context - Validated Context Packet.
   * @returns {Promise<Record<string, any>>} Page content model.
   */
  async generatePageContent(context) {
    const { systemPrompt, userPrompt } = promptBuilder.buildWritePrompt(context);
    const modelName = configManager.get('provider.ai.primaryModel', 'gemini-2.5-pro');

    logger.info('writer-engine', `Requesting content generation for target: "${context.seo.primaryKeyword}"...`);

    const rawResponse = await geminiAdapter.generateText(systemPrompt, userPrompt, modelName);

    try {
      const parsedContent = JSON.parse(rawResponse);
      
      // Basic structure validation
      if (!parsedContent.title || !parsedContent.content || !parsedContent.content.hero) {
        throw new Error('Missing essential page structure (title, content, or hero).');
      }

      logger.info('writer-engine', `Successfully generated content model for: "${context.location.city}".`);
      return parsedContent;
    } catch (err) {
      logger.error('writer-engine', 'Failed to parse AI output into valid content JSON structure.', { rawResponse, error: err });
      throw new PseoError(
        ERROR_CODES.AI_FAIL,
        `AI generated output failed JSON parsing: ${err.message}`,
        'writer-engine',
        'ERROR',
        'Check prompt template syntax or verify model parameters.',
        { rawResponse, parseError: err }
      );
    }
  }
}

export const writerEngine = new WriterEngine();
