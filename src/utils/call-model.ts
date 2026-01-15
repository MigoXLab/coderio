import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { logger } from './logger';
import { getModelConfig, type ModelConfig } from './config';

/**
 * Content part types for multimodal messages
 */
type ContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };

/**
 * Options for calling the model
 */
export interface CallModelOptions {
    question: string;
    imageUrls?: string | string[];
    streaming?: boolean;
    responseFormat?: { type: 'json_object' | 'text' };
    maxTokens?: number;
}

/**
 * Validate model configuration
 * @param config - Model configuration to validate
 * @throws Error if required fields are missing
 */
function validateModelConfig(config: ModelConfig | null | undefined): asserts config is ModelConfig {
    if (!config || !config.provider || !config.model || !config.baseUrl || !config.apiKey) {
        throw new Error(`Invalid model configuration. Required fields: provider, model, baseUrl, apiKey. Please check your config.yaml file.`);
    }
}

/**
 * Call an LLM model with the given options
 * @param options - Configuration options for the model call
 * @returns The model's text response
 */
export async function callModel(options: CallModelOptions): Promise<string> {
    const { question, imageUrls, streaming = false, responseFormat, maxTokens } = options;

    // Validate input
    if (!question || !question.trim()) {
        throw new Error('Question must be a non-empty string');
    }

    // Get and validate config separately
    let config: ModelConfig;
    try {
        config = getModelConfig();
        validateModelConfig(config);
    } catch (error) {
        if (error instanceof Error) {
            logger.printErrorLog(`Configuration error: ${error.message}`);
        }
        throw error;
    }

    try {
        const agentModel = new ChatOpenAI({
            modelName: config.model,
            apiKey: config.apiKey,
            configuration: {
                baseURL: config.baseUrl,
            },
            ...(maxTokens && { maxTokens }),
            temperature: 0.1,
            streaming,
            ...(streaming && {
                streamingOptions: {
                    includeUsage: true,
                },
            }),
            ...(!streaming && { streamUsage: true }),
            ...(responseFormat && { modelKwargs: { response_format: responseFormat } }),
        });

        // Build multimodal content parts: text + image_url
        const contentParts: ContentPart[] = [];
        contentParts.push({ type: 'text', text: question });

        // Add images if provided
        if (imageUrls) {
            const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
            for (const url of urls) {
                if (url && typeof url === 'string' && url.trim()) {
                    contentParts.push({ type: 'image_url', image_url: { url: url.trim() } });
                }
            }
        }

        // Create user message - use array if multimodal, string if text-only
        const userMessage = new HumanMessage({
            content: contentParts.length > 1 ? contentParts : question,
        });

        const message = await agentModel.invoke([userMessage]);

        if (!message.text) {
            throw new Error('Model returned empty response');
        }

        return message.text;
    } catch (error) {
        if (error instanceof Error) {
            logger.printErrorLog(`[${config.model}] Error details: ${error.message}`);
            if (error.stack) {
                logger.printTestLog(`[${config.model}] Stack trace: ${error.stack}`);
            }
        }
        throw new Error(`${config.model} model request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
