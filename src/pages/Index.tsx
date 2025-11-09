import { Hero } from "@/components/Hero";
import { RiskAssessmentTool } from "@/components/RiskAssessmentTool";
import { Features } from "@/components/Features";
import { DataSources } from "@/components/DataSources";
import { CTA } from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <RiskAssessmentTool />
      <Features />
      <DataSources />
      <CTA />
    </div>
  );
};

export default Index;
