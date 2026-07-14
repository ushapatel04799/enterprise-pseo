import { EventEmitter } from 'node:events';
import { logger } from './logger.js';

/**
 * Global event bus for programmatic SEO engine coordination.
 * Enforces pre-defined event contracts.
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    // Pre-registered event constants for type safety
    this.EVENTS = {
      DATASET_LOADED: 'datasetLoaded',
      VALIDATION_COMPLETED: 'validationCompleted',
      KNOWLEDGE_BUILT: 'knowledgeBuilt',
      CONTEXT_CREATED: 'contextCreated',
      CONTENT_GENERATED: 'contentGenerated',
      SEO_COMPLETED: 'seoCompleted',
      PAGE_GENERATED: 'pageGenerated',
      BUILD_COMPLETED: 'buildCompleted',
      DEPLOYMENT_COMPLETED: 'deploymentCompleted',
      ERROR_ENCOUNTERED: 'errorEncountered',
    };
  }

  /**
   * Publishes an event with payload, logging it automatically.
   * @param {string} eventName - One of EventBus.EVENTS values.
   * @param {Record<string, any>} payload - Payload data.
   */
  publish(eventName, payload = {}) {
    if (!Object.values(this.EVENTS).includes(eventName)) {
      logger.warn('event-bus', `Attempted to publish unregistered event: "${eventName}"`, { payload });
    }

    logger.debug('event-bus', `Publishing event: "${eventName}"`, {
      traceId: payload.traceId,
      projectId: payload.projectId,
    });

    this.emit(eventName, payload);
  }

  /**
   * Subscribes to an event.
   * @param {string} eventName - One of EventBus.EVENTS values.
   * @param {Function} listener - Callback function.
   */
  subscribe(eventName, listener) {
    if (!Object.values(this.EVENTS).includes(eventName)) {
      logger.warn('event-bus', `Subscribing to unregistered event: "${eventName}"`);
    }
    this.on(eventName, listener);
  }

  /**
   * Subscribes to an event once.
   */
  subscribeOnce(eventName, listener) {
    this.once(eventName, listener);
  }

  /**
   * Unsubscribes from an event.
   */
  unsubscribe(eventName, listener) {
    this.off(eventName, listener);
  }
}

export const eventBus = new EventBus();
