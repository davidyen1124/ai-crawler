const { chromium } = require('playwright')
const { analyzeCssSelector } = require('./openai')

async function crawlWebsite(url, initialSelector, scrapingGoal) {
  const browser = await chromium.launch({
    headless: false
  })

  const context = await browser.newContext()
  const page = await context.newPage()
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(url)

  // Custom wait function
  const waitForContent = async (page, selector, timeout = 30000) => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      const elements = await page.$$(selector)
      if (elements.length > 0) {
        return true
      }
      await page.waitForTimeout(100)
    }
    return false
  }

  // Wait for the initial selector with a timeout
  const contentLoaded = await waitForContent(page, initialSelector)
  if (!contentLoaded) {
    console.warn(
      'Timeout reached while waiting for initial content. Proceeding anyway.'
    )
  }

  let selector = initialSelector
  let continueExploration = true
  const extractedData = []
  const triedSelectors = [initialSelector]

  // Function to add red border with ID
  await page.evaluate(() => {
    window.addRedBorder = (sel) => {
      const elements = document.querySelectorAll(sel)
      elements.forEach((el) => {
        el.style.border = '2px solid red'
        el.setAttribute('data-highlight', 'true')
      })
      if (elements.length > 0) {
        elements[0].scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
      return elements.length
    }
  })

  // Function to remove red border
  await page.evaluate(() => {
    window.removeRedBorder = () => {
      const elements = document.querySelectorAll('[data-highlight="true"]')
      elements.forEach((el) => {
        el.style.border = ''
        el.removeAttribute('data-highlight')
      })
    }
  })

  do {
    // Remove previous highlights
    await page.evaluate(() => window.removeRedBorder())

    // Highlight the elements with a red border and scroll the first one into view
    const highlightedCount = await page.evaluate(
      (sel) => window.addRedBorder(sel),
      selector
    )

    // Take a screenshot of the page and convert it to base64
    const screenshot = await page.screenshot({
      fullPage: true
    })
    const screenshotBase64 = Buffer.from(screenshot).toString('base64')

    // Get a simplified tree structure of the DOM
    const { treeStructure } = await page.evaluate((sel) => {
      const elements = document.querySelectorAll(sel)

      function getSimpleTreeStructure(element, depth = 0) {
        const indent = '  '.repeat(depth)
        let result = `${indent}${element.tagName.toLowerCase()}`

        if (element.id) {
          result += `#${element.id}`
        }

        if (element.className) {
          result += `.${element.className}` // Only add the first class
        }

        result += '\n'

        for (const child of element.children) {
          result += getSimpleTreeStructure(child, depth + 1)
        }

        return result
      }

      let treeStructure = 'No elements found matching the selector'
      if (elements.length > 0) {
        treeStructure = Array.from(elements)
          .map((el) => getSimpleTreeStructure(el))
          .join('\n')
      }

      return {
        highlightedCount: elements.length,
        treeStructure
      }
    }, selector)

    // console.log('Simplified DOM Tree Structure:')
    // console.log(treeStructure)

    // Analyze the current selector
    const analysis = await analyzeCssSelector(
      selector,
      screenshotBase64,
      highlightedCount,
      triedSelectors,
      treeStructure,
      scrapingGoal
    )

    selector = analysis.suggestedSelector
    continueExploration = analysis.continueExploration
    triedSelectors.push(selector)

    console.log('Analysis:', analysis)

    if (!continueExploration) {
      // Extract information using the optimized selector
      const elements = await page.$$(selector)

      for (const element of elements) {
        const elementInfo = await element.textContent()
        extractedData.push(elementInfo.trim())
      }
    }
  } while (continueExploration)

  await context.close()
  await browser.close()

  console.log('Final optimized selector:', selector)
  console.log('Extracted data:', extractedData)
}

// Example usage
const scrapingGoal = 'Extract the titles of each post'
crawlWebsite(
  'https://slickdeals.net/forums/forumdisplay.php?f=9',
  'body',
  scrapingGoal
).catch(console.error)
