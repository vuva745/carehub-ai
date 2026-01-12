import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tab14ClientVoice } from "./Tab14ClientVoice";
import { Tab14_1VoiceSlogans } from "./Tab14_1VoiceSlogans";

export function Tab14Container() {
  const [activeTab, setActiveTab] = useState("client-voice");

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="client-voice">Client Voice & Wellbeing</TabsTrigger>
            <TabsTrigger value="voice-slogans">Live Voice Slogans</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab === "client-voice" ? <Tab14ClientVoice /> : <Tab14_1VoiceSlogans />}
      </div>
    </div>
  );
}
