# coderio

Coding agent for production grade software engineering projects.

## Installation

```bash
npm install -g coderio
# or
pnpm add -g coderio
```

## Configuration

Before using CodeRio, you need to create a configuration file with your LLM API credentials.

### 1. Create Configuration Directory

```bash
mkdir -p ~/.coderio
```

### 2. Create Configuration File

Create `~/.coderio/config.yaml` with the following content:

```yaml
model:
    provider: openai
    model: gemini-3-pro-preview
    baseUrl: your-api-endpoint-url
    apiKey: your-google-api-key-here

figma:
    token: your-figma-token-here
```

> Replace the following:
>
> - `your-google-api-key-here` with your actual Google API key from [Google AI Studio](https://aistudio.google.com/apikey)
> - `your-figma-token-here` with your Figma personal access token from [Figma Account Settings](https://www.figma.com/developers/api#access-tokens)

### 3. Quick Setup Command

```bash
# Create config directory and file in one command
cat > ~/.coderio/config.yaml << 'EOF'
model:
    provider: openai
    model: gemini-3-pro-preview
    baseUrl: your-api-endpoint-url
    apiKey: your-google-api-key-here

figma:
    token: your-figma-token-here
EOF
```

**Remember to replace the placeholders with your actual credentials!**

### 4. Verify Configuration

```bash
# Check if config file exists
cat ~/.coderio/config.yaml
```

## Usage

```bash
# TODO: Add more examples

# Check version
coderio --version
```

## Configuration Fields

| Field            | Required | Description                                                      |
| ---------------- | -------- | ---------------------------------------------------------------- |
| `model.provider` | ✅       | Provider name (e.g., openai)                                     |
| `model.model`    | ✅       | Model name (e.g., gemini-3-pro-preview)                          |
| `model.baseUrl`  | ✅       | API endpoint URL                                                 |
| `model.apiKey`   | ✅       | Your API key for authentication                                  |
| `figma.token`    | ✅       | Your Figma personal access token for accessing Figma design data |

## Troubleshooting

### Config file not found

If you see an error about config file not found:

```bash
# Check if config directory exists
ls -la ~/.coderio/

# If not, create it
mkdir -p ~/.coderio
```

### Invalid configuration

Make sure your YAML file:

- Uses spaces (not tabs) for indentation
- Has correct API key format
- Has valid URL format

## License

Apache-2.0
