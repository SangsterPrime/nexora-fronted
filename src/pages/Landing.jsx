import PublicLayout from '../layouts/PublicLayout'
import HeroSection from '../components/organisms/HeroSection'
import ProblemSection from '../components/organisms/ProblemSection'
import SolutionSection from '../components/organisms/SolutionSection'
import BenefitsSection from '../components/organisms/BenefitsSection'
import TargetUsersSection from '../components/organisms/TargetUsersSection'
import OperationalFlowSection from '../components/organisms/OperationalFlowSection'
import ModulesSection from '../components/organisms/ModulesSection'
import DashboardPreview from '../components/organisms/DashboardPreview'
import ArchitectureSection from '../components/organisms/ArchitectureSection'
import FinalCTASection from '../components/organisms/FinalCTASection'
import Footer from '../components/organisms/Footer'
import '../styles/pages/Home.css'

function Landing() {
  return (
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
        <ArchitectureSection />
        <FinalCTASection />
      </main>
      <Footer />
    </PublicLayout>
  )
}

export default Landing
