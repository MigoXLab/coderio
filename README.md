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
    name: gemini-3-pro-preview
    url: your-api-endpoint-url
    apiKey: your-google-api-key-here
```

> Replace `your-google-api-key-here` with your actual Google API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Quick Setup Command

```bash
# Create config directory and file in one command
cat > ~/.coderio/config.yaml << 'EOF'
model:
    name: gemini-3-pro-preview
    url: your-api-endpoint-url
    apiKey: your-google-api-key-here
EOF
```

**Remember to replace `your-google-api-key-here` with your actual Google API key!**

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

| Field          | Required | Description                             |
| -------------- | -------- | --------------------------------------- |
| `model.name`   | ✅       | Model name (e.g., gemini-3-pro-preview) |
| `model.url`    | ✅       | API endpoint URL                        |
| `model.apiKey` | ✅       | Your API key for authentication         |

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
