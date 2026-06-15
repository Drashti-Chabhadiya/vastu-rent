interface ParseUserAgentResult {
  device: string
  browser: string
  os: string
}

/**
 * Parses a user agent string to identify the OS, browser, and device model.
 */
export function parseUserAgent(userAgent: string | null): ParseUserAgentResult {
  if (!userAgent) {
    return { device: 'Unknown Device', browser: 'Browser', os: 'OS' }
  }

  let os = 'OS'
  let device = 'Desktop'
  let browser = 'Browser'

  // OS & Device detection
  if (/windows/i.test(userAgent)) {
    os = 'Windows'
    device = 'Windows PC'
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = 'macOS'
    device = 'Mac'
  } else if (/iphone/i.test(userAgent)) {
    os = 'iOS'
    device = 'iPhone'
  } else if (/ipad/i.test(userAgent)) {
    os = 'iOS'
    device = 'iPad'
  } else if (/android/i.test(userAgent)) {
    os = 'Android'
    device = 'Android Phone'

    // Dynamically extract exact Android model name from the user agent details
    const androidMatch = userAgent.match(/android \d+(?:\.\d+)*;\s*([^;)]+)/i)
    if (androidMatch && androidMatch[1]) {
      const model = androidMatch[1].split('Build/')[0].trim()
      if (model && model.length < 32 && !/wv|mobile|version/i.test(model)) {
        device = model
      }
    }
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux'
    device = 'Linux PC'
  }

  // Browser detection
  if (/chrome|crios/i.test(userAgent) && !/edge|opr|opera/i.test(userAgent)) {
    browser = 'Chrome'
  } else if (
    /safari/i.test(userAgent) &&
    !/chrome|crios|android/i.test(userAgent)
  ) {
    browser = 'Safari'
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Firefox'
  } else if (/edge|edg/i.test(userAgent)) {
    browser = 'Edge'
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera'
  }

  return { device, browser, os }
}
