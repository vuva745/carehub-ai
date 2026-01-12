import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Video, Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MedicationAIScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ medicine: string; dosage: string; timestamp: string } | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);

  const handleStartScan = () => {
    setIsScanning(true);
    // Simulate AI scan process
    setTimeout(() => {
      const results = [
        { medicine: "Metformin 500 mg", dosage: "1 tablet" },
        { medicine: "Insulin", dosage: "12 units" },
        { medicine: "Statin 40 mg", dosage: "1 tablet" },
      ];
      const randomResult = results[Math.floor(Math.random() * results.length)];
      setScanResult({
        medicine: randomResult.medicine,
        dosage: randomResult.dosage,
        timestamp: new Date().toLocaleTimeString(),
      });
      setIsScanning(false);
      setShowScanResult(true);
    }, 2000);
  };

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <h2 className="text-3xl font-bold text-foreground">Medication AI Scan</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <img
                src="/images/client-ruth.jpg"
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
            <div className="relative rounded-lg overflow-hidden bg-muted/30">
              {isScanning ? (
                <div className="aspect-video flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-lg font-semibold">Scanning Medication...</p>
                    <p className="text-sm text-muted-foreground">AI is analyzing the medication</p>
                  </div>
                </div>
              ) : scanResult ? (
                <>
                  <img
                    src="/images/nurse-medication.jpg"
                    alt="Medication Scan"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-primary/90 backdrop-blur text-primary-foreground rounded-lg p-4">
                    <p className="text-sm font-medium mb-1">{scanResult.timestamp}</p>
                    <p className="font-semibold">Medicine Identified: {scanResult.medicine}</p>
                    <p className="text-sm mt-1">Dosage: {scanResult.dosage}</p>
                  </div>
                </>
              ) : (
                <img
                  src="/images/nurse-medication.jpg"
                  alt="Medication Scan"
                  className="w-full h-auto"
                />
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button 
                className="flex-1" 
                size="lg" 
                onClick={handleStartScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    SCANNING...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    START SCAN
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                size="lg"
                onClick={() => setShowUploadDialog(true)}
              >
                <Video className="w-4 h-4 mr-2" />
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

      {/* Upload Video Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Video (NeoCam)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="med-video-file">Select Video File</Label>
              <Input
                id="med-video-file"
                type="file"
                accept="video/*"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload medication administration video from NeoCam
              </p>
            </div>
            <div>
              <Label htmlFor="med-video-notes">Notes (Optional)</Label>
              <Textarea
                id="med-video-notes"
                placeholder="Add any notes about this medication video..."
                className="mt-2"
              />
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium mb-1">7D-Proof Auto-Logging</p>
              <p className="text-xs text-muted-foreground">
                This video will be automatically logged with timestamp, location, and device sync information.
              </p>
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

      {/* Scan Result Dialog */}
      <Dialog open={showScanResult} onOpenChange={setShowScanResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Scan Result</DialogTitle>
          </DialogHeader>
          {scanResult && (
            <div className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                  <div>
                    <p className="font-bold text-lg">Medication Identified</p>
                    <p className="text-sm text-muted-foreground">Scan completed successfully</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Medicine Name</Label>
                  <p className="text-lg font-semibold mt-1">{scanResult.medicine}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Dosage</Label>
                  <p className="text-lg font-semibold mt-1">{scanResult.dosage}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Scan Time</Label>
                  <p className="text-sm text-muted-foreground mt-1">{scanResult.timestamp}</p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">7D-Proof Status:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Time Stamp:</span>
                    <span className="ml-2 font-medium">{new Date().toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">AI Verified:</span>
                    <span className="ml-2 font-medium text-success">✓ Verified</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nurse ID:</span>
                    <span className="ml-2 font-medium">N-105</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Device Sync:</span>
                    <span className="ml-2 font-medium text-success">✓ Synced</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowScanResult(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowScanResult(false);
                  setScanResult(null);
                }}>
                  Scan Another
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default MedicationAIScan;
