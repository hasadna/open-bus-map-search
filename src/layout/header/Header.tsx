import { Layout } from 'antd'
import { useContext } from 'react'
import { MenuOutlined } from '@ant-design/icons'
import cn from 'classnames'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import './Header.css'
import ToggleThemeButton from './ToggleThemeButton'
import { DonationButton } from './DonationButton'
import HeaderLinks from './HeaderLinks/HeaderLinks'
import { LanguageToggle } from './LanguageToggle'

const { Header } = Layout

const MainHeader = () => {
  const { isDarkTheme, toggleTheme } = useTheme()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  return (
    <Header className={cn('main-header', { dark: isDarkTheme })}>
      <MenuOutlined onClick={() => setDrawerOpen(true)} className="hideOnDesktop" />
      <div style={{ flex: 1, lineHeight: '1em' }}>
        לתשומת לבכם - עבור נסיעות שבוצעו לאחר ה12.06.2024 ישנם פערי נתונים. התקלה בתחקור ושאר
        הנתונים זמינים לשימושכם, תודה על ההבנה.
      </div>
      <HeaderLinks>
        <LanguageToggle />
        <ToggleThemeButton toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
        <DonationButton />
      </HeaderLinks>
    </Header>
  )
}

export default MainHeader
