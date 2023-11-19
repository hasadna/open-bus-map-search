import { Layout } from 'antd'

const { Footer } = Layout

const MainFooter = () => {
  return (
    <Footer style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
      <a href="https://github.com/hasadna/open-bus-map-search">Github</a>
      <a href="https://maakaf-landing-page.netlify.app/">Maakaf</a>
      <a href="https://www.hasadna.org.il/">Hasadna</a>
    </Footer>
  )
}
export default MainFooter
