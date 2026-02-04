import { FC } from 'react';
import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import TrustSection from '@/components/trust-section';
import PhilosophySection from '@/components/philosophy-section';
import FeaturesGrid from '@/components/features-grid';
import ResourcesSection from '@/components/resources-section';
import SpyingCTA from '@/components/spying-cta';
import LatestInsights from '@/components/latest-insights';
import Footer from '@/components/footer';

const CertoLandingPage: FC = () => {
  return (
    <div
      className="relative flex w-full max-w-[1440px] flex-col items-start justify-start bg-white mx-auto overflow-hidden"
    >
      <Header />
      <HeroSection />
      <TrustSection />
      <PhilosophySection />
      <FeaturesGrid />
      <ResourcesSection />
      <SpyingCTA />
      <LatestInsights />
      <Footer />
    </div>
  );
};

export default CertoLandingPage;
