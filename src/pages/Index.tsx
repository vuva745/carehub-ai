import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CareOverview from "@/components/tabs/CareOverview";
import MedicationAIScan from "@/components/tabs/MedicationAIScan";
import WoundCareAI from "@/components/tabs/WoundCareAI";
import FallRadarAI from "@/components/tabs/FallRadarAI";
import PlanningRoutes from "@/components/tabs/PlanningRoutes";
import AITriage from "@/components/tabs/AITriage";
import DoctorFamilyPortal from "@/components/tabs/DoctorFamilyPortal";
import FinanceBilling from "@/components/tabs/FinanceBilling";
import DevicesHardware from "@/components/tabs/DevicesHardware";
import HouseholdHelp from "@/components/tabs/HouseholdHelp";
import MaterialsStock from "@/components/tabs/MaterialsStock";
import CareTVSync from "@/components/tabs/CareTVSync";
import AIReportsInsights from "@/components/tabs/AIReportsInsights";
import { Tab14Container } from "@/components/tabs/Tab14Container";
import { Tab15FamilyDashboard } from "@/components/tabs/Tab15FamilyDashboard";
import { Tab16NursePerformance } from "@/components/tabs/Tab16NursePerformance";
import { Tab17LegalDispute } from "@/components/tabs/Tab17LegalDispute";
import { Tab18NeoPayEscrow } from "@/components/tabs/Tab18NeoPayEscrow";
import { Tab19SkillLab } from "@/components/tabs/Tab19SkillLab";
import { Tab20ESGDashboard } from "@/components/tabs/Tab20ESGDashboard";
import { Tab21AIControl } from "@/components/tabs/Tab21AIControl";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const tabs = [
    { value: "tab1", label: "Care Overview", subtitle: "(AI Live Monitoring)", component: CareOverview },
    { value: "tab2", label: "Medication AI Scan", subtitle: "", component: MedicationAIScan },
    { value: "tab3", label: "WoundCare AI", subtitle: "", component: WoundCareAI },
    { value: "tab4", label: "Planning & AI Visits", subtitle: "", component: PlanningRoutes },
    { value: "tab5", label: "FallRadar AI", subtitle: "", component: FallRadarAI },
    { value: "tab6", label: "AI Triage", subtitle: "(Phone Support)", component: AITriage },
    { value: "tab7", label: "Doctor & Family Portal", subtitle: "", component: DoctorFamilyPortal },
    { value: "tab8", label: "Finance & Billing", subtitle: "", component: FinanceBilling },
    { value: "tab9", label: "Devices & SmartCare Hardware", subtitle: "", component: DevicesHardware },
    { value: "tab10", label: "Household Help", subtitle: "", component: HouseholdHelp },
    { value: "tab11", label: "Materials & Stock Management", subtitle: "", component: MaterialsStock },
    { value: "tab12", label: "CareTV Sync", subtitle: "(Video Uploads)", component: CareTVSync },
    { value: "tab13", label: "AI Reports & Insights", subtitle: "", component: AIReportsInsights },
    { value: "tab14", label: "Client Voice & Wellbeing", subtitle: "(Live Slogans)", component: Tab14Container },
    { value: "tab15", label: "Family Dashboard", subtitle: "", component: Tab15FamilyDashboard },
    { value: "tab16", label: "Nurse Performance", subtitle: "", component: Tab16NursePerformance },
    { value: "tab17", label: "7D Proof Legal Dispute", subtitle: "", component: Tab17LegalDispute },
    { value: "tab18", label: "NeoPay Escrow", subtitle: "", component: Tab18NeoPayEscrow },
    { value: "tab19", label: "SkillLab & Certification", subtitle: "", component: Tab19SkillLab },
    { value: "tab20", label: "ESG & Impact", subtitle: "", component: Tab20ESGDashboard },
    { value: "tab21", label: "AI Control & Automation", subtitle: "", component: Tab21AIControl },
  ];

  const activeTabData = tabs.find((tab) => tab.value === activeTab);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 bg-primary text-primary-foreground flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">NeoCare</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex-col h-full bg-transparent space-y-1 p-2 overflow-y-auto custom-scrollbar items-stretch justify-start">
            {tabs.map((tab) => {
              const isPurpleTab = ["tab14", "tab15", "tab16", "tab17", "tab18", "tab19", "tab20", "tab21"].includes(tab.value);

              // Purple Styling (Tabs 14-21)
              const purpleClasses = "data-[state=active]:bg-background/10 data-[state=active]:text-purple-300 data-[state=active]:border-l-4 data-[state=active]:border-purple-500 data-[state=active]:shadow-[0_0_20px_rgba(168,85,247,0.3)]";
              const purpleTextGlow = "data-[state=active]:text-purple-200 data-[state=active]:drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]";
              const purpleSubtitleGlow = "data-[state=active]:text-purple-300/80 data-[state=active]:drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]";

              // Cyan Styling (Tabs 1-13)
              const cyanClasses = "data-[state=active]:bg-background/5 data-[state=active]:text-cyan-400 data-[state=active]:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
              const cyanTextGlow = "data-[state=active]:text-cyan-400 data-[state=active]:drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]";
              const cyanSubtitleGlow = "data-[state=active]:text-cyan-300 data-[state=active]:drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]";

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`w-full justify-start text-left shrink-0 hover:bg-primary-foreground/10 transition-all ${isPurpleTab ? purpleClasses : cyanClasses}`}
                >
                  <div className="text-sm py-1">
                    <div className={`font-medium ${isPurpleTab ? purpleTextGlow : cyanTextGlow}`}>
                      {tab.label}
                    </div>
                    {tab.subtitle && (
                      <div className={`text-xs opacity-70 data-[state=active]:opacity-100 ${isPurpleTab ? purpleSubtitleGlow : cyanSubtitleGlow}`}>
                        {tab.subtitle}
                      </div>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Content */}
        <main className="flex-1 overflow-x-auto overflow-y-auto">
          <Tabs value={activeTab} className="w-full h-full">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0 pt-0 h-full">
                <div className="h-full">
                  <tab.component />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
