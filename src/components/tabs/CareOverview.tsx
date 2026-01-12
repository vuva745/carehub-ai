import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, CheckCircle2, Wifi, Video, Package, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CareOverview = () => {
  const [careSessionActive, setCareSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState("00:00:00");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showMaterialsDialog, setShowMaterialsDialog] = useState(false);
  const [showVitalsDialog, setShowVitalsDialog] = useState(false);

  const handleStartSession = () => {
    setCareSessionActive(true);
    setSessionStartTime(new Date());
  };

  const handleEndSession = () => {
    setCareSessionActive(false);
    setSessionStartTime(null);
    setSessionDuration("00:00:00");
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (careSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - sessionStartTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setSessionDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [careSessionActive, sessionStartTime]);

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <h2 className="text-3xl font-bold text-foreground">Care Overview (AI Live Monitoring)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src="/images/client-henry.jpg"
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
            {careSessionActive && sessionStartTime && (
              <div className="mt-2 p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Active</span>
                  <span className="text-sm font-bold text-primary">{sessionDuration}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Started: {sessionStartTime.toLocaleTimeString()}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {!careSessionActive ? (
              <Button className="w-full" size="lg" onClick={handleStartSession}>
                Start Care Session
              </Button>
            ) : (
              <Button className="w-full" variant="destructive" size="lg" onClick={handleEndSession}>
                End Care Session
              </Button>
            )}
            <Button 
              className="w-full" 
              variant="outline" 
              size="lg"
              onClick={() => setShowUploadDialog(true)}
              disabled={!careSessionActive}
            >
              <Video className="w-4 h-4 mr-2" />
              Upload Video (NeoCam)
            </Button>
            <Button 
              className="w-full" 
              variant="outline" 
              size="lg"
              onClick={() => setShowMaterialsDialog(true)}
              disabled={!careSessionActive}
            >
              <Package className="w-4 h-4 mr-2" />
              Log Materials Used
            </Button>
            <Button 
              className="w-full" 
              variant="outline" 
              size="lg"
              onClick={() => setShowVitalsDialog(true)}
              disabled={!careSessionActive}
            >
              <Activity className="w-4 h-4 mr-2" />
              Record Vitals
            </Button>
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
            <CardTitle>Vitals Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Heart Rate Trend (Last 7 Days)</h4>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={[
                  { day: "Mon", hr: 72 },
                  { day: "Tue", hr: 75 },
                  { day: "Wed", hr: 74 },
                  { day: "Thu", hr: 78 },
                  { day: "Fri", hr: 76 },
                  { day: "Sat", hr: 77 },
                  { day: "Sun", hr: 78 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[70, 80]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hr" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Video Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Video (NeoCam)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-file">Select Video File</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="video-notes">Notes (Optional)</Label>
              <Textarea
                id="video-notes"
                placeholder="Add any notes about this video..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle upload logic here
                setShowUploadDialog(false);
              }}>
                Upload Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Materials Dialog */}
      <Dialog open={showMaterialsDialog} onOpenChange={setShowMaterialsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Materials Used</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="material-name">Material Name</Label>
              <Input
                id="material-name"
                placeholder="e.g., Gloves, Bandages, Syringes"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="material-quantity">Quantity</Label>
              <Input
                id="material-quantity"
                type="number"
                placeholder="Enter quantity"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="material-notes">Notes (Optional)</Label>
              <Textarea
                id="material-notes"
                placeholder="Add any additional notes..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMaterialsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle material logging logic here
                setShowMaterialsDialog(false);
              }}>
                Log Materials
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Vitals Dialog */}
      <Dialog open={showVitalsDialog} onOpenChange={setShowVitalsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Vitals</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="blood-pressure-systolic">Blood Pressure (Systolic)</Label>
              <Input
                id="blood-pressure-systolic"
                type="number"
                placeholder="120"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="blood-pressure-diastolic">Blood Pressure (Diastolic)</Label>
              <Input
                id="blood-pressure-diastolic"
                type="number"
                placeholder="80"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
              <Input
                id="heart-rate"
                type="number"
                placeholder="72"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="oxygen-saturation">Oxygen Saturation (%)</Label>
              <Input
                id="oxygen-saturation"
                type="number"
                placeholder="98"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="36.7"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="glucose">Glucose (mmol/L)</Label>
              <Input
                id="glucose"
                type="number"
                step="0.1"
                placeholder="5.5"
                className="mt-2"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="vitals-notes">Notes (Optional)</Label>
              <Textarea
                id="vitals-notes"
                placeholder="Add any observations or notes..."
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowVitalsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle vitals recording logic here
              setShowVitalsDialog(false);
            }}>
              Record Vitals
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareOverview;
