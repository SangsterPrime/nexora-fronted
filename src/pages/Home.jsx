import HeroSection from '../components/organisms/HeroSection'
import OperationalFlowSection from '../components/organisms/OperationalFlowSection'
import ModulesSection from '../components/organisms/ModulesSection'
import DashboardPreview from '../components/organisms/DashboardPreview'
import ProveedoresSection from '../components/organisms/ProveedoresSection'
import ArchitectureSection from '../components/organisms/ArchitectureSection'
import SystemStatusSection from '../components/organisms/SystemStatusSection'
import '../styles/pages/Home.css'

function Home() {
  return (
    <main className="home-page">
      <HeroSection />
      <OperationalFlowSection />
      <ModulesSection />
      <DashboardPreview />
      <ProveedoresSection />
      <ArchitectureSection />
      <SystemStatusSection />
    </main>
  )
}

export default Home
