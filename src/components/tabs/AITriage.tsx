import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle2, AlertTriangle, Clock, FileText, User, MapPin, Calendar, Download, Share2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AITriage = () => {
  const [callActive, setCallActive] = useState(true);
  const [callStartTime] = useState(new Date());
  const [callDuration, setCallDuration] = useState(0); // in seconds
  const [callEndTime, setCallEndTime] = useState<Date | null>(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showSendReportDialog, setShowSendReportDialog] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const [shareMethod, setShareMethod] = useState("email");
  const [shareEmail, setShareEmail] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [reportRecipient, setReportRecipient] = useState("");
  const [reportNotes, setReportNotes] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callActive) {
      timer = setInterval(() => {
        setCallDuration(Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callActive, callStartTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallEndTime(new Date());
    setCallActive(false);
  };

  const callSummary = {
    patient: "Rachel Woods",
    age: 67,
    address: "123 Cedar Lane, Apt 4B",
    riskLevel: "MODERATE RISK",
    symptoms: ["Dizziness", "Increased thirst", "Elevated blood glucose"],
    aiAssessment: "Mild to moderate hyperglycemic symptoms detected",
    recommendations: [
      "Schedule follow-up visit within 24 hours",
      "Monitor blood sugar levels regularly",
      "Maintain proper hydration",
      "Review medication dosage with primary care physician"
    ],
    callId: "TRI-2024-0429-1125",
    recordingAvailable: true,
    transcriptAvailable: true
  };

  if (!callActive) {
    return (
      <>
      <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Call Ended</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCallActive(true)}>
              <Phone className="w-4 h-4 mr-2" />
              Start New Call
            </Button>
          </div>
        </div>

        {/* Call Summary Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Call Completed Successfully</h3>
                <p className="text-muted-foreground">Call ID: {callSummary.callId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold text-primary">{formatDuration(callDuration)}</p>
              {callEndTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Ended: {callEndTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Patient</span>
              </div>
              <p className="text-lg font-semibold">{callSummary.patient}</p>
              <p className="text-sm text-muted-foreground">Age: {callSummary.age}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </div>
              <p className="text-sm">{callSummary.address}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h4 className="font-bold text-lg">Risk Assessment: {callSummary.riskLevel}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{callSummary.aiAssessment}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Symptoms Reported</h4>
              <div className="space-y-2">
                {callSummary.symptoms.map((symptom, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                {callSummary.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-primary/10">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Call Documentation */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Call Documentation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Call Recording</span>
                </div>
                {callSummary.recordingAvailable ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="outline">Processing</Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">AI Transcript</span>
                </div>
                {callSummary.transcriptAvailable ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="outline">Processing</Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">7D-Proof Log</span>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  Auto-logged
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDownloadDialog(true)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowShareDialog(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Next Steps</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Follow-up Visit</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Schedule within 24 hours</p>
                <Button size="sm" variant="outline" onClick={() => setShowScheduleDialog(true)}>Schedule Visit</Button>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Send Report</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Share with primary care physician</p>
                <Button size="sm" variant="outline" onClick={() => setShowSendReportDialog(true)}>Send Report</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Call Notes Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Call Notes Summary</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-2">Key Points Discussed:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Patient experiencing dizziness and increased thirst</li>
                <li>Blood glucose monitoring recommended</li>
                <li>Medication review scheduled with primary care physician</li>
                <li>Patient advised to maintain hydration</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium mb-2">AI Assessment Summary:</p>
              <p className="text-sm">{callSummary.aiAssessment}. Recommend immediate glucose monitoring and potential medication adjustment.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Download Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Download Call Documentation</DialogTitle>
            <DialogDescription>
              Select the format and items you want to download
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="format">File Format</Label>
              <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="docx">Word Document (.docx)</SelectItem>
                  <SelectItem value="txt">Text File (.txt)</SelectItem>
                  <SelectItem value="csv">CSV Data (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Include in Download</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="recording" defaultChecked className="w-4 h-4" />
                  <label htmlFor="recording" className="text-sm">Call Recording</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="transcript" defaultChecked className="w-4 h-4" />
                  <label htmlFor="transcript" className="text-sm">AI Transcript</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="summary" defaultChecked className="w-4 h-4" />
                  <label htmlFor="summary" className="text-sm">Call Summary</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="notes" defaultChecked className="w-4 h-4" />
                  <label htmlFor="notes" className="text-sm">Call Notes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="proof" defaultChecked className="w-4 h-4" />
                  <label htmlFor="proof" className="text-sm">7D-Proof Log</label>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-1">File Information</p>
              <p className="text-xs text-muted-foreground">Call ID: {callSummary.callId}</p>
              <p className="text-xs text-muted-foreground">Date: {callEndTime?.toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">Duration: {formatDuration(callDuration)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              // Simulate download
              const fileName = `Triage_Call_${callSummary.callId}.${downloadFormat}`;
              const blob = new Blob([`Call Documentation for ${callSummary.patient}\nCall ID: ${callSummary.callId}\nDate: ${callEndTime?.toLocaleString()}\nDuration: ${formatDuration(callDuration)}`], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
              URL.revokeObjectURL(url);
              setShowDownloadDialog(false);
            }}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Call Documentation</DialogTitle>
            <DialogDescription>
              Share the call documentation with team members or external contacts
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="shareMethod">Share Method</Label>
              <Select value={shareMethod} onValueChange={setShareMethod}>
                <SelectTrigger id="shareMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="link">Shareable Link</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="system">Internal System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {shareMethod === "email" && (
              <div className="grid gap-2">
                <Label htmlFor="shareEmail">Recipient Email</Label>
                <Input
                  id="shareEmail"
                  type="email"
                  placeholder="recipient@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </div>
            )}
            {shareMethod === "link" && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-2">Shareable Link</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={`https://neocare.app/share/${callSummary.callId}`}
                    readOnly
                    className="text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(`https://neocare.app/share/${callSummary.callId}`);
                  }}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Link expires in 7 days</p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium mb-2">What will be shared:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Call Summary</li>
                <li>Patient Information</li>
                <li>AI Assessment</li>
                <li>Recommended Actions</li>
                <li>Call Notes</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              // Simulate sharing
              alert(shareMethod === "email" 
                ? `Call documentation shared via email to ${shareEmail || "recipient"}` 
                : shareMethod === "link"
                ? "Shareable link copied to clipboard"
                : `Call documentation shared via ${shareMethod}`);
              setShowShareDialog(false);
            }}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Visit Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Follow-up Visit</DialogTitle>
            <DialogDescription>
              Schedule a follow-up visit for {callSummary.patient}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="visitDate">Visit Date</Label>
              <Input
                id="visitDate"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visitTime">Visit Time</Label>
              <Input
                id="visitTime"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visitType">Visit Type</Label>
              <Select defaultValue="follow-up">
                <SelectTrigger id="visitType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                  <SelectItem value="urgent">Urgent Visit</SelectItem>
                  <SelectItem value="routine">Routine Check</SelectItem>
                  <SelectItem value="assessment">Health Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visitNotes">Notes (Optional)</Label>
              <Textarea
                id="visitNotes"
                placeholder="Add any specific notes for this visit..."
                rows={3}
              />
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Recommended: Schedule within 24 hours due to moderate risk assessment
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              if (scheduleDate && scheduleTime) {
                alert(`Visit scheduled for ${new Date(scheduleDate + 'T' + scheduleTime).toLocaleString()}`);
                setShowScheduleDialog(false);
                setScheduleDate("");
                setScheduleTime("");
              } else {
                alert("Please select both date and time");
              }
            }}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Report Dialog */}
      <Dialog open={showSendReportDialog} onOpenChange={setShowSendReportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Report to Primary Care Physician</DialogTitle>
            <DialogDescription>
              Send the triage call report to the patient's primary care physician
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select value={reportRecipient} onValueChange={setReportRecipient}>
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-smith">Dr. Smith - Primary Care</SelectItem>
                  <SelectItem value="dr-jones">Dr. Jones - Endocrinologist</SelectItem>
                  <SelectItem value="dr-williams">Dr. Williams - Family Medicine</SelectItem>
                  <SelectItem value="custom">Custom Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportRecipient === "custom" && (
              <div className="grid gap-2">
                <Label htmlFor="customEmail">Email Address</Label>
                <Input
                  id="customEmail"
                  type="email"
                  placeholder="physician@example.com"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="reportNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="reportNotes"
                placeholder="Add any additional context or instructions..."
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-2">Report Contents:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Patient: {callSummary.patient} (Age {callSummary.age})</li>
                <li>Call Date: {callEndTime?.toLocaleDateString()}</li>
                <li>Call Duration: {formatDuration(callDuration)}</li>
                <li>Risk Assessment: {callSummary.riskLevel}</li>
                <li>Symptoms Reported</li>
                <li>AI Assessment</li>
                <li>Recommended Actions</li>
                <li>Call Notes Summary</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">7D-Proof Documentation</p>
              </div>
              <p className="text-xs text-muted-foreground">
                All call data is automatically logged and included in the report
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendReportDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              if (reportRecipient) {
                alert(`Report sent to ${reportRecipient === "custom" ? "custom email" : reportRecipient}`);
                setShowSendReportDialog(false);
                setReportRecipient("");
                setReportNotes("");
              } else {
                alert("Please select a recipient");
              }
            }}>
              <FileText className="w-4 h-4 mr-2" />
              Send Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">AI Triage (Phone Support)</h2>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <span className="text-sm">Monday, Apr 29 - 11:25 AM</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Caller Info */}
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-2xl font-bold">Rachel Woods</h3>
            <p className="text-muted-foreground">Age: 67</p>
            <p className="text-sm text-muted-foreground mt-2">123 Cedar Lane, Apt 4B</p>
          </div>

          <Button variant="destructive" size="lg" className="w-full" onClick={handleEndCall}>
            <Phone className="w-5 h-5 mr-2" />
            END CALL
          </Button>

          <div className="space-y-4 pt-4 border-t border-cyan-400/50">
            <div>
              <h4 className="text-sm font-semibold text-primary mb-3">AI TRIAGE CHECKLIST</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">A</Badge>
                <div>
                  <p className="font-medium">MILD SYMPTOMS</p>
                  <p className="text-sm text-muted-foreground">DETECTED</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-primary">AI Triage checklist</h4>
              {[
                "Greet and identify",
                "Verify details",
                "Assess condition",
                "Discuss care"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-cyan-400/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Call Duration: {formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Triage Assessment */}
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <h3 className="text-xl font-bold mb-2">Check Blood Sugar</h3>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                HIGH GLUCOSE LEVEL DETECTED
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-primary mb-3">AI TRIAGE CHECKLIST</h4>
              <div className="space-y-2">
                {[
                  { text: "Greet and identify", checked: true },
                  { text: "Verify details", checked: true },
                  { text: "Assess condition", checked: true },
                  { text: "Discuss care", checked: true },
                  { text: "Follow-up visit needed", checked: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.checked ? 'bg-success border-success' : 'border-muted-foreground'
                    }`}>
                      {item.checked && <CheckCircle2 className="w-4 h-4 text-success-foreground" />}
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card border border-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-warning mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">MODERATE RISK</h4>
                  <p className="text-sm text-muted-foreground">
                    Increased likelihood of hyperglycemia requiring intervention
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <h4 className="text-sm font-semibold mb-2">7D-PROOF DOCUMENTING</h4>
              <p className="text-sm text-muted-foreground">Start: 11:23 AM (02:14)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Call Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Call Notes & Summary</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm font-medium mb-2">Symptoms Reported:</p>
            <p className="text-sm text-muted-foreground">Patient reports feeling dizzy and experiencing increased thirst. Blood glucose levels appear elevated based on symptoms.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm font-medium mb-2">AI Assessment:</p>
            <p className="text-sm text-muted-foreground">Mild to moderate hyperglycemic symptoms detected. Recommend immediate glucose monitoring and potential medication adjustment.</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium mb-2">Recommended Action:</p>
            <p className="text-sm">Schedule follow-up visit within 24 hours. Patient advised to monitor blood sugar levels and maintain hydration.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AITriage;
