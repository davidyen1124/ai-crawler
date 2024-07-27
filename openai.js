const { OpenAI } = require('openai')
const { OPENAI_API_KEY, MODEL } = require('./config')

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

async function analyzeCssSelector(
  currentSelector,
  screenshotBase64,
  highlightedCount,
  triedSelectors,
  treeStructure,
  scrapingGoal
) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI assistant that analyzes and optimizes CSS selectors for web scraping.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze the following information:

Scraping Goal: ${scrapingGoal}
Current CSS Selector: ${currentSelector}
Number of highlighted elements: ${highlightedCount}
Previously tried selectors: ${triedSelectors.join(', ')}
DOM Tree Structure:
${treeStructure}

Your task:
1. Analyze the current CSS selector, the provided screenshot, and the number of highlighted elements.
2. Consider the previously tried selectors to avoid suggesting them again.
3. Determine if the current selector is optimal for reliable web scraping.
4. If not optimal, suggest an improved CSS selector that would be more robust and reliable.
5. Provide reasoning for your decision, considering the number of highlighted elements.
6. Decide if further exploration is needed or if the current/suggested selector is sufficient.
7. Set continueExploration to true ONLY if you're suggesting a new selector that hasn't been tried before.
   Set it to false if the current selector is optimal or if you've exhausted all improvement possibilities.
8. Consider the scraping goal when making your decision. If the current selector satisfies the goal, you may decide to stop exploring even if further refinements are possible.

Remember: continueExploration should be false when you're satisfied with the current selector, have no more suggestions, or when the current selector satisfies the scraping goal.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${screenshotBase64}`
            }
          }
        ]
      }
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'provide_selector_analysis',
          description:
            'Provide analysis and suggestions for CSS selector optimization',
          parameters: {
            type: 'object',
            properties: {
              reasoning: {
                type: 'string',
                description:
                  'Explanation of the analysis and reasoning behind the suggestion'
              },
              suggestedSelector: {
                type: 'string',
                description:
                  "The suggested CSS selector or the current one if it's optimal"
              },
              continueExploration: {
                type: 'boolean',
                description:
                  'Whether further exploration is needed (true) or not (false)'
              }
            },
            required: ['reasoning', 'suggestedSelector', 'continueExploration']
          }
        }
      }
    ],
    tool_choice: {
      type: 'function',
      function: { name: 'provide_selector_analysis' }
    },
    temperature: 0
  })

  const toolCall = response.choices[0].message.tool_calls[0]
  const result = JSON.parse(toolCall.function.arguments)
  return result
}

module.exports = {
  analyzeCssSelector
}
