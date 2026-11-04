import { useState } from "react";
import { Menu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const [navOpen, setNavOpen] = useState(false);

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

  // Selecting a page also closes the mobile drawer.
  const selectTab = (value: string) => {
    setActiveTab(value);
    setNavOpen(false);
  };

  // Shared between the desktop sidebar and the mobile drawer.
  const navList = (
    <Tabs value={activeTab} onValueChange={selectTab} className="flex-1 flex flex-col min-h-0">
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
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar (tablet and up) */}
      <div className="hidden md:flex w-64 bg-primary text-primary-foreground flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">NeoCare</h1>
        </div>
        {navList}
      </div>

      {/* Mobile navigation drawer */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-primary text-primary-foreground border-r-0 flex flex-col">
          <SheetHeader className="p-4 text-left">
            <SheetTitle className="text-xl font-bold text-primary-foreground">NeoCare</SheetTitle>
          </SheetHeader>
          {navList}
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header: menu button, current page and a scrollable page strip */}
        <header className="md:hidden bg-primary text-primary-foreground">
          <div className="flex items-center gap-3 px-3 py-2">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-primary-foreground/40 px-3 py-2 text-sm font-semibold"
            >
              <Menu className="w-5 h-5" />
              Menu
            </button>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{activeTabData?.label}</div>
              {activeTabData?.subtitle && <div className="text-xs opacity-70 truncate">{activeTabData.subtitle}</div>}
            </div>
          </div>
          <div className="overflow-x-auto border-t border-primary-foreground/20">
            <div className="flex gap-2 px-3 py-2 w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => selectTab(tab.value)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                    activeTab === tab.value
                      ? "border-cyan-400 bg-background/10 text-cyan-300"
                      : "border-primary-foreground/30 text-primary-foreground/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

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
