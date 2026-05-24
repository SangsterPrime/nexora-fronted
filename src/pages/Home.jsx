import PublicLayout from '../components/templates/PublicLayout'
import HeroSection from '../components/organisms/HeroSection'
import ProblemSection from '../components/organisms/ProblemSection'
import SolutionSection from '../components/organisms/SolutionSection'
import BenefitsSection from '../components/organisms/BenefitsSection'
import TargetUsersSection from '../components/organisms/TargetUsersSection'
import OperationalFlowSection from '../components/organisms/OperationalFlowSection'
import ModulesSection from '../components/organisms/ModulesSection'
import DashboardPreview from '../components/organisms/DashboardPreview'
import ProveedoresSection from '../components/organisms/ProveedoresSection'
import ArchitectureSection from '../components/organisms/ArchitectureSection'
import SystemStatusSection from '../components/organisms/SystemStatusSection'
import FinalCTASection from '../components/organisms/FinalCTASection'
import Footer from '../components/organisms/Footer'
import '../styles/pages/Home.css'

function Home() {
  return (
    <>
      <PublicLayout>
        <main className="home-page">
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <BenefitsSection />
          <TargetUsersSection />
          <OperationalFlowSection />
          <ModulesSection />
          <DashboardPreview />
          <ProveedoresSection />
          <ArchitectureSection />
          <SystemStatusSection />
          <FinalCTASection />
        </main>
        <Footer />
      </PublicLayout>
    </>
  )
}

export default Home
