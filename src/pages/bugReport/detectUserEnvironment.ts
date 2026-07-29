const OS_PATTERNS: [RegExp, string][] = [
  [/Windows/, 'Windows'],
  [/Mac OS X/, 'macOS'],
  [/Android/, 'Android'],
  [/iPhone|iPad/, 'iOS'],
  [/Linux/, 'Linux'],
]

const BROWSER_PATTERNS: [RegExp, string][] = [
  [/Edg\/(\d+(\.\d+)*)/, 'Edge'],
  [/OPR\/(\d+(\.\d+)*)/, 'Opera'],
  [/Chrome\/(\d+(\.\d+)*)/, 'Chrome'],
  [/Firefox\/(\d+(\.\d+)*)/, 'Firefox'],
  // Safari's "Safari/x.x" token is just the WebKit build number, not the browser version.
  // The real version is in "Version/x.x", which only Safari's UA includes.
  [/Version\/(\d+(\.\d+)*).*Safari/, 'Safari'],
]

function detectOS(userAgent: string): string {
  const match = OS_PATTERNS.find(([pattern]) => pattern.test(userAgent))
  return match ? match[1] : 'Unknown OS'
}

function detectBrowser(userAgent: string): string {
  for (const [pattern, name] of BROWSER_PATTERNS) {
    const match = userAgent.match(pattern)
    if (match) return `${name} ${match[1]}`
  }
  return 'Unknown browser'
}

export function detectUserEnvironment(userAgent = navigator.userAgent): string {
  return `${detectBrowser(userAgent)} / ${detectOS(userAgent)}`
}
