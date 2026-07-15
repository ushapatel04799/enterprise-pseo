import { configManager } from '../core/config-manager.js';
import { pluginEngine } from './plugin-engine.js';

/**
 * Prompt Builder constructing structural prompt templates for AI inference layers.
 */
class PromptBuilder {
  /**
   * Generates LLM prompt instructions based on a page context packet.
   * @param {Record<string, any>} context - Validated Context Packet.
   * @returns {Record<string, any>} Structure containing system and user prompts.
   */
  buildWritePrompt(context) {
    const { business, location, service, nearby, seo } = context;

    const activePlugin = pluginEngine.getActivePlugin();
    const brandName = activePlugin ? activePlugin.name : business.name;

    // Define standard system prompt targeting Gemini 2.5 Pro or customize via niche plugin prompts
    const systemPrompt = activePlugin && activePlugin.prompts?.systemPrompt
      ? activePlugin.prompts.systemPrompt.replace(/{brandName}/g, brandName)
      : `You are a Senior SEO Content Specialist representing ${brandName}.
Your job is to write a highly localized, helpful, and unique service landing page.

Strict Quality Controls:
1. NEVER invent credentials, reviews, awards, or pricing details.
2. Focus deeply on local relevance (mention county, climate, terrain, and landmarks when appropriate).
3. Follow Google Ads and helpful content guidelines: be transparent, use clear calls-to-action, and avoid fake urgency.
4. Keep structural heading hierarchy clean: utilize exactly one H1 per page, followed by H2 and H3 elements.`;

    // Interpolate user instruction prompt
    const userPrompt = `Generate a page model in JSON format for:
- Service: ${service.name} (${service.description})
- Target Location: ${location.city}, ${location.state} (${location.county}, Population: ${location.population})
- Nearby Cities: ${nearby.map(c => `${c.city} (${c.distance_miles ? `${c.distance_miles}mi` : 'nearby'})`).join(', ')}
- Landmarks: ${location.landmarks.join(', ') || 'N/A'}
- Contact Phone: ${business.phone}
- Primary Keyword: "${seo.primaryKeyword}"
- Secondary Keywords: ${seo.secondaryKeywords.map(k => `"${k}"`).join(', ')}

Output the content divided into these sections:
1. hero: Catchy title incorporating primary keyword, subtitle, and primary call-to-action.
2. localIntro: Explanation of how ${service.name} is handled in ${location.city}'s specific climate/environment.
3. serviceDetails: 3 core bullet points explaining key advantages of our process.
4. nearbyExclusion: A paragraph detailing service coverage in nearby areas: ${nearby.map(c => c.city).join(', ')}.
5. faq: Exactly 3 relevant question-and-answer pairs targeting the local service.

Generate the output JSON matching this structure:
{
  "title": "SEO Page Title",
  "description": "Meta description",
  "content": {
    "hero": { "title": "", "subtitle": "", "ctaText": "" },
    "localIntro": "",
    "serviceDetails": ["", "", ""],
    "nearbyExclusion": "",
    "faqs": [
      { "question": "", "answer": "" }
    ]
  }
}`;

    // Calculate basic token approximation (1 word ~= 1.3 tokens)
    const totalWords = (systemPrompt + userPrompt).split(/\s+/).length;
    const estimatedTokens = Math.ceil(totalWords * 1.35);

    return {
      systemPrompt,
      userPrompt,
      estimatedTokens,
    };
  }
}

export const promptBuilder = new PromptBuilder();
