import { render } from '@testing-library/react'
import i18n from 'src/locale/allTranslations'
import { OutboundArrow } from './OutboundArrow'

/** MUI names the glyph in the icon's test id, which is the only thing telling the two apart. */
const arrowName = () =>
  document.querySelector('[data-testid]')!.getAttribute('data-testid')!.replace('Icon', '')

describe('OutboundArrow', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('points away from the text in a left-to-right language', () => {
    render(<OutboundArrow />)

    expect(arrowName()).toBe('NorthEast')
  })

  // north-east in Hebrew would aim back over the link it trails
  it('mirrors in a right-to-left language', async () => {
    await i18n.changeLanguage('he')

    render(<OutboundArrow />)

    expect(arrowName()).toBe('NorthWest')
  })
})
