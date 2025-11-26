import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, CheckCircle2, Wifi } from "lucide-react";
import clientHenry from "@/assets/client-henry.jpg";

export const CareOverview = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={clientHenry}
                alt="Henry Clark"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-2xl font-bold">Henry Clark</h3>
                <p className="text-muted-foreground">Aged 67</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">COPD + Diabetess Type II</p>
              <p>Assigned Sarah Jones</p>
              <p className="font-medium">Next Visit: Today at 10:30</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">Devices Online:</span>
                <div className="flex gap-2">
                  <Pill className="w-5 h-5 text-primary" />
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <Wifi className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Care Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Care Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "ADL Support",
              "Medication Administration",
              "Glucose Monitoring",
              "Wound Dressing",
              "Fall Risk Check",
              "Family Communication",
              "Report & Review"
            ].map((task) => (
              <div key={task} className="flex items-center gap-3">
                <Checkbox id={task} />
                <label htmlFor={task} className="text-sm cursor-pointer">
                  {task}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Care Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Care Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" size="lg">Start Care Session</Button>
            <Button className="w-full" variant="outline" size="lg">End Care Session</Button>
            <Button className="w-full" variant="outline" size="lg">Upload Video (NeoCam)</Button>
            <Button className="w-full" variant="outline" size="lg">Log Materials Used</Button>
            <Button className="w-full" variant="outline" size="lg">Record Vitals</Button>
          </CardContent>
        </Card>

        {/* AI-Powered Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Medication Alert</h4>
              <p className="text-sm text-muted-foreground">Insulin scheduled aled at 11:30</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Wound Status</h4>
              <p className="text-sm text-muted-foreground">Slight redness detected yesterday</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">FallRadar</h4>
              <p className="text-sm text-muted-foreground">No events in athe last 48 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7D-Proof Log */}
        <Card>
          <CardHeader>
            <CardTitle>7D-Proof Log – Automated</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Time Stamp</p>
              <p className="text-sm text-muted-foreground">Nurse ID</p>
              <p className="text-sm text-muted-foreground">Client ID</p>
              <p className="text-sm text-muted-foreground">Location Match</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connect Loghe</p>
              <p className="text-sm text-muted-foreground">Audit Tag</p>
              <p className="text-sm text-muted-foreground">Device Sync</p>
            </div>
          </CardContent>
        </Card>

        {/* Vitals Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>Vtals Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Blood Pressure</span>
              <span className="text-sm font-medium">128/81</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Heart Rate</span>
              <span className="text-sm font-medium">78</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Oxygen Saturation</span>
              <span className="text-sm font-medium">95%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Temperature</span>
              <span className="text-sm font-medium">36.7°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Glucose</span>
              <span className="text-sm font-medium">7.8 mmol/L</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
