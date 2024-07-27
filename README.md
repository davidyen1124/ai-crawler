# AI-Powered Web Scraper

This project is an AI-powered web scraper that uses OpenAI's GPT model to dynamically analyze and optimize CSS selectors for reliable web scraping.

## Features

- Dynamic CSS selector optimization using AI
- Visual feedback with highlighted elements in the browser
- Automatic screenshot capture for AI analysis
- Simplified DOM tree structure analysis
- Configurable scraping goals

## Prerequisites

- Node.js (v14 or later recommended)
- An OpenAI API key

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/ai-powered-web-scraper.git
   cd ai-powered-web-scraper
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `config.js` file in the root directory with your OpenAI API key:
   ```javascript
   module.exports = {
     OPENAI_API_KEY: 'your-api-key-here',
     MODEL: 'gpt-4o-mini'
   }
   ```

## Usage

To start the web scraper, run:

```
node crawler.js
```

You can modify the `scrapingGoal` and target URL in the `crawler.js` file to customize the scraping task.

## How it Works

1. The scraper starts with an initial CSS selector and loads the target webpage.
2. It captures a screenshot and analyzes the DOM structure.
3. The AI model analyzes the current selector, screenshot, and DOM structure to suggest optimizations.
4. The process repeats until the AI determines the selector is optimal or no further improvements can be made.
5. Finally, the scraper extracts the desired information using the optimized selector.

## Files

- `crawler.js`: Main script that controls the web scraping process.
- `openai.js`: Handles interactions with the OpenAI API for selector analysis.
- `config.js`: Contains configuration settings (API key, model name).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
