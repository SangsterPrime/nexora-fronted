import Navbar from '../organisms/Navbar'
import '../../styles/templates/PublicLayout.css'

function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <Navbar />
      <div className="public-layout__content">{children}</div>
    </div>
  )
}

export default PublicLayout
