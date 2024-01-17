import { NavLink } from 'react-router-dom'
import busImage from '../../img/busImg.png'
import './HomePage.scss'

export const HomePage = () => {
  return (
    <>
      <img src={busImage} alt="Public Transportaion Bus Illustration" />
      <h1>ברוכים הבאים לדאטאבוס</h1>
      <h2>הפלטפורמה הפתוחה לנתוני אמת על איכות קווי התחבורה הציבורית בישראל </h2>
      <h3>
        מטרת האתר היא לשפר את איכות התחבורה הציבורית בארץ ע״י מתן מידע אמין לעיתונאים, אזחרים, חברות
        התחבורה, וגורמי ממשל בישראל.
      </h3>
      <div className="main-menu">
        <NavLink to="/timeline" className="nav-link">
          הסטוריית לוחות זמנים
        </NavLink>
        <NavLink to="/gaps" className="nav-link">
          {' '}
          נסיעות שלא בוצעו{' '}
        </NavLink>
        <NavLink to="/gaps_pattern" className="nav-link">
          דפוסי נסיעות שלא בוצעו
        </NavLink>
        <NavLink to="/map" className="nav-link">
          מפה בזמן אמת
        </NavLink>
      </div>
    </>
  )
}

export default HomePage
