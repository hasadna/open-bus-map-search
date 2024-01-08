import React from 'react'
import { BulbFilled, BulbOutlined } from '@ant-design/icons'

interface ToggleThemeButtonProps {
  toggleTheme: () => void
  isDarkTheme: boolean
}

const ToggleThemeButton: React.FC<ToggleThemeButtonProps> = ({ toggleTheme, isDarkTheme }) => {
  return (
    <button
      className="theme-icon"
      onClick={toggleTheme}
      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
      {isDarkTheme ? (
        <BulbOutlined style={{ color: '#fff', fontSize: '1.5em' }} />
      ) : (
        <BulbFilled style={{ fontSize: '1.5em' }} />
      )}
    </button>
  )
}

export default ToggleThemeButton
