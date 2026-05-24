import Navbar from '../components/organisms/Navbar'
import '../styles/layouts/PublicLayout.css'

function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <Navbar />
      <div className="public-layout__content">{children}</div>
    </div>
  )
}

export default PublicLayout
