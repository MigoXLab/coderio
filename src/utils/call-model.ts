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
    if (!config || !config.name || !config.url || !config.apiKey) {
        throw new Error(`Invalid model configuration. ` + `Required fields: name, url, apiKey. ` + `Please check your config.yaml file.`);
    }
}

/**
 * Call an LLM model with the given options
 * @param options - Configuration options for the model call
 * @returns The model's text response
 */
export async function callModel(options: CallModelOptions): Promise<string> {
    const { question, imageUrls, streaming = false, responseFormat, maxTokens } = options;

    const config = getModelConfig();
    validateModelConfig(config);

    try {
        const agentModel = new ChatOpenAI({
            modelName: config.name,
            apiKey: config.apiKey,
            configuration: {
                baseURL: config.url,
            },
            maxTokens: maxTokens,
            temperature: 0.1,
            streaming: streaming,
            // For streaming mode: enable usage in streaming options
            ...(streaming && {
                streamingOptions: {
                    includeUsage: true,
                },
            }),
            // For non-streaming mode: enable streamUsage
            ...(!streaming && { streamUsage: true }),
            ...(responseFormat && { modelKwargs: { response_format: responseFormat } }),
        });

        // Build multimodal content parts: text + image_url
        const contentParts: ContentPart[] = [];

        if (question) {
            contentParts.push({ type: 'text', text: question });
        }

        if (imageUrls) {
            const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
            for (const url of urls) {
                if (url) {
                    contentParts.push({ type: 'image_url', image_url: { url } });
                }
            }
        }

        // Create user message
        const userMessage = new HumanMessage({
            content: contentParts.length > 0 ? contentParts : question,
        });
        const message = await agentModel.invoke([userMessage]);
        return message.text;
    } catch (error) {
        if (error instanceof Error) {
            logger.printErrorLog(`❌ [${config.name}] Error details: ${error.message}`);
            if (error.stack) {
                logger.printTestLog(`❌ [${config.name}] Stack trace: ${error.stack}`);
            }
        }
        throw new Error(`${config.name} model request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
