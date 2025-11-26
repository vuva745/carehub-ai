import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Plus } from "lucide-react";
import { CareOverview } from "@/components/tabs/CareOverview";
import { MedicationAIScan } from "@/components/tabs/MedicationAIScan";
import { WoundCareAI } from "@/components/tabs/WoundCareAI";
import { FallRadarAI } from "@/components/tabs/FallRadarAI";
import { PlanningRoutes } from "@/components/tabs/PlanningRoutes";
import { AITriage } from "@/components/tabs/AITriage";
import { DoctorFamilyPortal } from "@/components/tabs/DoctorFamilyPortal";
import { FinanceBilling } from "@/components/tabs/FinanceBilling";
import { DevicesHardware } from "@/components/tabs/DevicesHardware";
import { HouseholdHelp } from "@/components/tabs/HouseholdHelp";
import { MaterialsStock } from "@/components/tabs/MaterialsStock";
import { CareTVSync } from "@/components/tabs/CareTVSync";
import { AIReportsInsights } from "@/components/tabs/AIReportsInsights";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const tabs = [
    { value: "tab1", label: "Care Overview", subtitle: "(AI Live Monitoring)", component: CareOverview },
    { value: "tab2", label: "Medication AI Scan", subtitle: "", component: MedicationAIScan },
    { value: "tab3", label: "WoundCare AI", subtitle: "", component: WoundCareAI },
    { value: "tab4", label: "FallRadar AI", subtitle: "", component: FallRadarAI },
    { value: "tab5", label: "Planning & Routes", subtitle: "", component: PlanningRoutes },
    { value: "tab6", label: "AI Triage", subtitle: "(Phone Support)", component: AITriage },
    { value: "tab7", label: "Doctor & Family Portal", subtitle: "", component: DoctorFamilyPortal },
    { value: "tab8", label: "Finance & Billing", subtitle: "", component: FinanceBilling },
    { value: "tab9", label: "Devices & SmartCare Hardware", subtitle: "", component: DevicesHardware },
    { value: "tab10", label: "Household Help", subtitle: "", component: HouseholdHelp },
    { value: "tab11", label: "Materials & Stock Management", subtitle: "", component: MaterialsStock },
    { value: "tab12", label: "CareTV Sync", subtitle: "(Video Uploads)", component: CareTVSync },
    { value: "tab13", label: "AI Reports & Insights", subtitle: "", component: AIReportsInsights },
  ];

  const activeTabData = tabs.find((tab) => tab.value === activeTab);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 bg-primary text-primary-foreground flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">NeoCare</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="flex-col h-auto bg-transparent space-y-1 p-2">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-full justify-start text-left data-[state=active]:bg-background data-[state=active]:text-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                <div className="text-sm">
                  <div className="font-medium">{tab.label}</div>
                  {tab.subtitle && (
                    <div className="text-xs opacity-80">{tab.subtitle}</div>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">HomeCare Dashboard</h2>
            <span className="text-muted-foreground">
              Tab {activeTab.replace('tab', '')}: {activeTabData?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-auto p-8">
          <Tabs value={activeTab} className="w-full">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                <tab.component />
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
