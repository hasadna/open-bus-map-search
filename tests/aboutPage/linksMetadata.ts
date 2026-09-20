type LinkTest = {
  name: string
  linkName: string
  expectedHref?: string
  expectedURL?: string | RegExp
  expectedHeading?: string
}

const linkTests: LinkTest[] = [
  {
    name: 'donations link leads to sadna site',
    linkName: 'תרומות קטנות נוספות',
    expectedHref: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
  },
  {
    name: 'Google Analytics link',
    linkName: 'Google Analytics',
    expectedHref: 'https://marketingplatform.google.com/about/analytics/',
  },
  {
    name: 'privacy read more link',
    linkName: 'קראו כאן',
    expectedHref: 'https://support.google.com/analytics/answer/6004245?hl=iw',
  },
  {
    name: 'CC BY-SA license link',
    linkName: 'רישיון CC BY-SA',
    expectedHref: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    name: 'Creative Commons link',
    linkName: 'Creative Commons',
    expectedHref: 'https://creativecommons.org/',
  },
  {
    name: 'contact link',
    linkName: 'צרו איתנו קשר',
    expectedHref: 'https://www.hasadna.org.il/%D7%A6%D7%95%D7%A8-%D7%A7%D7%A9%D7%A8/',
  },
  {
    name: 'Slack link',
    linkName: 'דברו איתנו על זה בסלאק',
    expectedHref:
      'https://hasadna.slack.com/join/shared_invite/zt-167h764cg-J18ZcY1odoitq978IyMMig#/shared-invite/email',
  },
  {
    name: 'servers donation link',
    linkName: 'שרתים עולים כסף - עזרו לנו להמשיך לתחזק ולפתח את הפרויקט!',
    expectedHref: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
  },
  {
    name: 'Open API link',
    linkName: 'Open API',
    expectedHref: 'https://open-bus-stride-api.hasadna.org.il/docs',
  },
  {
    name: 'funding donations link',
    linkName: 'ותרומות קטנות נוספות של ידידי ואוהדי הסדנא',
    expectedHref: 'https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
  },
  {
    name: 'Applitools link',
    linkName: 'Applitools',
    expectedHref: 'https://applitools.com/',
  },
  {
    name: 'contributing link',
    linkName: 'קרא כאן',
    expectedHref: 'https://github.com/hasadna/open-bus-map-search/blob/main/CONTRIBUTING.md',
  },
]

export default linkTests
