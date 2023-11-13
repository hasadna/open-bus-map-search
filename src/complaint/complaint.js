import { chromium } from 'playwright'
// import { express } from 'express'

const url =
  'https://forms.gov.il/globaldata/getsequence/getHtmlForm.aspx?formType=PniotMot%40mot.gov.il'

const complaint = {
  // first page
  firstName: 'אבי',
  lastName: 'כהן',
  id: '316159003',
  email: 'avi.cohen@gmail.com',
  phone: '0536218158',

  // third page
  operator: 'אגד',
  licensePlate: '1234567',
  time: new Date(),
  lineNumber: '1',
  routeName: 'כרמיאל-כרמיאל',
}

const complaintTypes = ['אי עצירה בתחנה', 'אחר']

const browser = await chromium.launch({
  //   headless: false,
})
const context = await browser.newContext()
await context.tracing.start({
  screenshots: true,
  snapshots: true,
  sources: true,
})
const page = await context.newPage()
try {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url)
      await page.click('text=כניסה לטופס')
      await page.getByLabel('שם פרטי').fill(complaint.firstName)
      await page.getByLabel('שם משפחה').fill(complaint.lastName)
      await page.getByLabel('מספר זהות').fill(complaint.id)
      await page.getByLabel('טלפון נייד', { exact: true }).fill(complaint.phone)
      await page.getByRole('textbox', { name: 'דואר אלקטרוני' }).fill(complaint.email)
      await page.getByRole('button', { name: 'לשלב הבא' }).click()
      //   await page.getByLabel('נושא הפנייה').getByLabel('בחירה מהרשימה').first().click()
      //   await new Promise((r) => setTimeout(r, 100))
      await page.getByLabel('נושא הפנייה', { exact: true }).fill('אוטובוס')
      await new Promise((r) => setTimeout(r, 100))
      await page.getByLabel('נושא הפנייה').getByLabel('בחירה מהרשימה').first().click()
      await new Promise((r) => setTimeout(r, 100))
      await page.getByText('אוטובוס', { exact: true }).click()
      await new Promise((r) => setTimeout(r, 100))
      await page.getByLabel('סוג הפנייה').fill(complaintTypes[0])
      await new Promise((r) => setTimeout(r, 100))
      await page.getByText(complaintTypes[0]).click()
      await new Promise((r) => setTimeout(r, 100))
      await page.getByRole('button', { name: 'לשלב הבא' }).click()
      await page.getByLabel('חברת האוטובוסים (מפעיל)').fill(complaint.operator)
      await page.getByRole('textbox', { name: 'מספר רישוי' }).fill(complaint.licensePlate)
      await page.getByRole('textbox', { name: 'תאריך האירוע' }).fill(formatDate(complaint.time))
      await page.getByRole('textbox', { name: 'שעת האירוע' }).fill(formatTime(complaint.time))
      await page.getByLabel('שעת המתנה מ').fill('00:00')
      await page.getByLabel('שעת המתנה עד').fill('23:59')
      await page
        .getByRole('textbox', { name: 'תוכן הפנייה' })
        .fill('האוטובוס עצר בתחנה ולא נסע עד שעה מאוחרת')
      await page.getByRole('textbox', { name: 'מספר קו' }).fill(complaint.lineNumber)
      await page.getByLabel('מוצא/ יעד (כיוון )').fill(complaint.routeName)

      for (let i = 0; i < 10 && (await page.getByText('הנחיות לצירוף מסמכים').isHidden()); i++) {
        // retry until it works
        await page.getByRole('button', { name: 'לשלב הבא' }).click()
        await page.waitForTimeout(300)
      }
      break
    } catch {
      console.log(`attempt ${attempt} failed`)
    }
  }
  //   await new Promise((r) => setTimeout(r, 1000000))
  //   await page.getByRole('button', { name: 'לשלב הבא' }).click({ force: true })
  //   await page.getByRole('button', { name: 'לשלב הבא' }).click()
} finally {
  await context.tracing.stop({
    path: `/traces/trace.zip`,
  })
  //   await page.waitForTimeout(10000)
  await browser.close()
}
/**
 * @param {Date} date
 */
function formatDate(date) {
  const d = leadZero(date.getDate())
  const month = leadZero(date.getMonth() + 1)
  const year = date.getFullYear()
  return `${d}/${month}/${year}`
}

function formatTime(date) {
  return `${leadZero(date.getHours())}:${leadZero(date.getMinutes())}`
}

function leadZero(number) {
  return number < 10 ? `0${number}` : number
}
