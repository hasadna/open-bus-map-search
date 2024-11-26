import React from 'react'
import { Box, Grid, Modal, Typography, useMediaQuery } from '@mui/material'
import i18n from 'src/locale/allTranslations'

interface DonateModalProps {
  isVisible: boolean
  onClose: () => void
}

export const DonateModal: React.FC<DonateModalProps> = ({ isVisible, onClose }) => {
  /**
   * @description This hook is used to determine if the image should collapse or not based on if the user is a mobile, tablet user or not.
   */
  const shouldImgCollapse = useMediaQuery('(max-width: 950px)')

  const boxStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '1250px',
    maxHeight: 'calc(100vh - 210px)',
    overflowY: 'auto',
    width: '80%',
    bgcolor: 'background.paper',
    textAlign: shouldImgCollapse ? 'center' : 'left',
    boxShadow: 24,
    p: 4,
  } as const

  return (
    <Modal
      open={isVisible}
      onClose={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        color: 'text.primary', // Dynamically uses the theme’s text color
      }}>
      <Box dir={i18n.dir()} sx={boxStyle}>
        <button onClick={onClose} className="close-modal-icon">
          X
        </button>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          כיצד לתרום?
        </Typography>
        <p>
          מאחורי הקלעים של הפרוייקטים פועל צוות קטן ומסור, שדואג לארגון מפגשי הפיתוח וההאקתונים
          ותחזוקת השרתים, שמכתת רגליו בין משרדי ממשלה כדי לשכנע, ללחוץ, ולנדנד לשחרר עוד ועוד
          מאגרים; מוודא שהתקשורת תכיר את העבודה שלנו וגם תדע לפנות אלינו בשביל נתונים וניתוחים,
          ועושה עוד המון עבודה שוטפת כדי שהפרוייקטים שלנו ייצרו שינוי בעולם. אנחנו זקוקים לתמיכה של
          הקהילה כדי להמשיך ולפעול למען ממשל פתוח יותר. היו אבירי שקיפות והצטרפו בתמיכה חודשית.
        </p>
        <Grid container spacing={2} direction={shouldImgCollapse ? 'column-reverse' : 'row'}>
          <Grid item xs={6}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <h2>תרומה דרך אתר jgive.com</h2>
              <a
                href="https://www.jgive.com/new/he/ils/donation-targets/3268"
                target="_blank"
                rel="noreferrer">
                <img
                  src="https://www.hasadna.org.il/wp-content/uploads/2017/12/%D7%AA%D7%A8%D7%95%D7%9E%D7%95%D7%AA.jpg"
                  alt="קישור לתרומה"
                  width={'90%'}
                  style={{ maxWidth: '420px' }}
                />
                <img
                  src="https://www.hasadna.org.il/wp-content/uploads/2018/08/button-300x73.png"
                  alt="תרום עכשיו"
                  style={{ margin: shouldImgCollapse ? 'auto' : '', display: 'block' }}
                />
              </a>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <h2>תרומה דרך העברה בנקאית</h2>
            <p>
              מומלץ לתרום דרך העברה בנקאית לחשבון הבנק של הסדנא לידע ציבורי, מכיוון שבאפיק זה העמלה
              נמוכה יותר
            </p>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              בנק: יו-בנק (26) <br />
              סניף: רחביה (262)
              <br />
              חשבון: 419931
              <br />
              שם החשבון: הסדנא לידע ציבורי
            </Typography>
            <sub>
              נא לציין שם מלא וליצור קשר במייל info@hasadna.org.il לאחר התרומה על מנת שנוכל לשלוח
              קבלה
            </sub>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default DonateModal
