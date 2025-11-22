export default [
  {
    name: 'donations link leads to sadna site',
    linkName: 'תרומות קטנות נוספות',
    expectedHeading: 'הסדנא לידע ציבורי פותחת ומנגישה מידע',
  },
  {
    name: 'Google Analytics link',
    linkName: 'Google Analytics',
    expectedURL: 'https: //marketingplatform.google.com/about/analytics/',
  },
  {
    name: 'privacy read more link',
    linkName: 'קראו כאן',
    expectedURL: /support\.google\.com\/analytics\/answer\/6004245\?hl=iw/,
  },
  {
    name: 'CC BY-SA license link',
    linkName: 'רישיון CC BY-SA',
    expectedURL: 'https: //creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    name: 'Creative Commons link',
    linkName: 'Creative Commons',
    expectedURL: 'https: //creativecommons.org/',
  },
  {
    name: 'contact link',
    linkName: 'צרו איתנו קשר',
    expectedURL: 'https: //www.hasadna.org.il/צור-קשר/',
  },
  {
    name: 'Slack link',
    linkName: 'דברו איתנו על זה בסלאק',
    expectedURL:
      'https: //hasadna.slack.com/join/shared_invite/zt-167h764cg-J18ZcY1odoitq978IyMMig#/shared-invite/email',
  },
  {
    name: 'servers donation link',
    linkName: 'שרתים עולים כסף - עזרו לנו להמשיך לתחזק ולפתח את הפרויקט!',
    expectedURL: 'https: //www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
  },
  {
    name: 'Open API link',
    linkName: 'Open API',
    expectedHeading: 'Open Bus Stride API',
  },
  {
    name: 'funding donations link',
    linkName: 'ותרומות קטנות נוספות של ידידי ואוהדי הסדנא',
    expectedURL: 'https: //www.jgive.com/new/he/ils/donation-targets/3268#donation-modal',
  },
  {
    name: 'Applitools link',
    linkName: 'Applitools',
    expectedURL: 'https: //applitools.com/',
  },
  {
    name: 'contributing link',
    linkName: 'קרא כאן',
    expectedURL: 'https: //github.com/hasadna/open-bus-map-search/blob/main/CONTRIBUTING.md',
  },
]
