import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Smartphone, CheckCircle2, MapPin, User2, RefreshCw } from "lucide-react";

const WoundCareAI = () => {
  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <h2 className="text-3xl font-bold text-foreground">WoundCare AI</h2>
      {/* Client Info Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Client Name</h2>
                <p className="text-lg text-muted-foreground">67 years Old</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">Assigned Nurse</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Risk Level:</span>
              <Badge className="bg-yellow-600 hover:bg-yellow-700">Medium</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Next Visit:</span>
              <span>Today at 10am to 12pm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Devices:</span>
              <span>NeoCam</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="wound-dressing" defaultChecked />
              <label htmlFor="wound-dressing" className="font-medium">Wound Dressing</label>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">VitalBox</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">BarsBand</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wound Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Wound Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "clean", label: "Clean Wound", checked: true },
              { id: "dressing", label: "Apply Dressing", checked: true },
              { id: "photograph", label: "Photograph Wound", checked: true },
              { id: "update", label: "Update Document.", checked: true }
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox id={item.id} defaultChecked={item.checked} />
                <label htmlFor={item.id} className="text-sm cursor-pointer">
                  {item.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Wound AI Scan */}
        <Card>
          <CardHeader>
            <CardTitle>Wound AI Scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src="/images/wound.png"
                alt="Wound Scan"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">Image from NeoCam</p>
          </CardContent>
        </Card>

        {/* WOUND AI Scan Results */}
        <Card>
          <CardHeader>
            <CardTitle>WOUND AI Scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">AI Analysis</h4>
              <ul className="space-y-1 text-sm">
                <li>• Slight redness</li>
                <li>• Moderate exudate</li>
                <li>• No signs of infection</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WOUND ALERTS */}
        <Card>
          <CardHeader>
            <CardTitle>WOUND ALERTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-semibold">Wound Alterts</h4>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Reduce Pressure</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7D-Proof Status */}
        <Card>
          <CardHeader>
            <CardTitle>7D-Proof Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Time Stamp</span>
              </div>
              <div className="flex items-center gap-2">
                <User2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Nurse ID</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location Match</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Device Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Client ID</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">AI Verification</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">1 7D-proof Status</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WoundCareAI;
