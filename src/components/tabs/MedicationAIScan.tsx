import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import clientRuth from "@/assets/client-ruth.jpg";
import nurseMedication from "@/assets/nurse-medication.jpg";

export const MedicationAIScan = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <img
                src={clientRuth}
                alt="Ruth Johnson"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-bold">Ruth Johnson</h3>
                <p className="text-sm text-muted-foreground">Age- 67</p>
                <Badge className="mt-2 bg-yellow-600 hover:bg-yellow-700">Medium</Badge>
              </div>
              <p className="text-sm font-medium">Next Visit: Today at 1:30</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground">AI PREVIEW</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Metformin correctly identified (1tablet)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7D-Proof Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">(Auto Logged)</p>
            <p className="text-sm text-muted-foreground">Time Stamp</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI SCAN – Medication Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={nurseMedication}
                alt="Medication Scan"
                className="w-full h-auto"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-primary/90 backdrop-blur text-primary-foreground rounded-lg p-4">
                <p className="text-sm font-medium mb-1">10:20 AM</p>
                <p className="font-semibold">Medicine Identified: Metformin 500 mg</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button className="flex-1" size="lg">START SCAN</Button>
              <Button variant="outline" className="flex-1" size="lg">
                UPLOAD VIDEO (NeoCam)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7D-Proof Status (Auto Logged)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Time Stamp</p>
              <p className="text-muted-foreground">AI Verific</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Nurse ID</p>
              <p className="text-muted-foreground">Device Sync</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Client ID</p>
              <p className="text-muted-foreground">Blockchain Hash</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Location Match</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>MedList / Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Insulin injection,</p>
                <p className="text-sm text-muted-foreground">12 units - Due at</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Metformin 500 mg</p>
                <p className="text-sm text-muted-foreground">1 tablet</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Statin 40 mg</p>
                <p className="text-sm text-muted-foreground">1 tablet</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Safety Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Monitor patient closely (low: 3,4 mmol/L)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No known types</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
