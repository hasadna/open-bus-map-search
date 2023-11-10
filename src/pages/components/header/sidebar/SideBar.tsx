import { useState } from 'react'
import Menu from './menu/Menu'
import { MenuOutlined } from '@ant-design/icons'
import './sidebar.scss'
import cn from 'classnames'

const SidebarToggle = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => (
  <div className="sidebar-menu-toggle" onClick={() => setOpen(!open)}>
    <MenuOutlined />
  </div>
)

const Logo = () => <h1 className={'sidebar-logo'}>דאטאבוס</h1>

export default function SideBar() {
  const [open, setOpen] = useState(false)
  return (
    <aside className={cn('sidebar', { open })}>
      <Logo />
      <SidebarToggle open={open} setOpen={setOpen} />
      <Menu />
    </aside>
  )
}
