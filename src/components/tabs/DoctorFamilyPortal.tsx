import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, Camera, AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const DoctorFamilyPortal = () => {
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const allUpdates = [
    { from: "Marian Lindeman", time: "9:45 AM", date: "Today", message: "Arrived late after dinner with my son. All is OK. Thanks!", type: "message" },
    { from: "Trish Lindeman", time: "9:30 AM", date: "Today", message: "Please make sure my mother gets her medications today!", type: "message" },
    { from: "Lois Caro", time: "Yesterday", date: "Apr 28, 2024", message: "Poop from chair. Sorry for the mess.", type: "message" },
    { from: "Prakgent Paragh", time: "Yesterday", date: "Apr 28, 2024", message: "Patient is doing well. No concerns.", type: "message" },
    { from: "Nurse Sarah", time: "8:15 AM", date: "Today", message: "Wound dressing changed. Healing progress noted.", type: "medical" },
    { from: "Dr. Smith", time: "7:45 AM", date: "Today", message: "Medication review completed. Dosage adjusted.", type: "medical" },
    { from: "System", time: "6:30 AM", date: "Today", message: "Vitals recorded: BP 128/81, HR 78, Temp 36.7°C", type: "system" },
    { from: "NeoCam", time: "5:20 AM", date: "Today", message: "Video uploaded from morning care session", type: "system" },
    { from: "AI Triage", time: "4:10 AM", date: "Today", message: "Automated health check completed. All parameters normal.", type: "system" },
    { from: "Family Member", time: "Yesterday", date: "Apr 28, 2024", message: "Thank you for the update. We appreciate your care.", type: "message" },
    { from: "Nurse Emma", time: "Yesterday", date: "Apr 28, 2024", message: "Fall risk assessment completed. Safety measures in place.", type: "medical" },
    { from: "Care Team", time: "Yesterday", date: "Apr 28, 2024", message: "Weekly care plan review scheduled for next Monday.", type: "system" },
  ];

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Doctor & Family Portal</h2>
        <Button variant="outline">
          <User className="w-4 h-4 mr-2" />
          Profile Settings
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Patients List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">PATIENTS</h3>
          <div className="space-y-3">
            {[
              { name: "John Marchand", status: "Needs Care", badge: "Reeds Care", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
              { name: "Anne Hofman", status: "Recent Activity", badge: "Recent Activity", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
              { name: "Michael Nolting", status: "No Updates", badge: "No Updates", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
              { name: "Albert Busing", status: "No Updates", badge: "No Updates", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
            ].map((patient, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer">
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.status}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{patient.badge}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">MESSAGES</h3>
          <div className="space-y-3">
            {[
              { from: "Marian Lindeman", time: "9:45 AM", message: "Arrived late after dinner with my son. All is OK. Thanks!" },
              { from: "Trish Lindeman", time: "Yesterday", message: "Please make sure my mother gets her medications today!" },
              { from: "Lois Caro", time: "Yesterday", message: "Poop from chair. Sorry for the mess." },
              { from: "Prakgent Paragh", time: "Yesterday", message: "" },
            ].map((msg, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm">{msg.from}</span>
                  <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                {msg.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => setShowAllUpdates(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            ALL UPDATES
          </Button>
        </Card>

        {/* Visit Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">VISIT DETAILS</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vogan visit</p>
              <p className="font-medium">2: Apr 24, 2024</p>
            </div>
            
            <div className="aspect-video rounded-lg bg-muted overflow-hidden">
              <img
                src="/images/visit.jpeg"
                alt="Visit Details"
                className="w-full h-full object-cover"
              />
            </div>

            <Badge variant="outline" className="bg-primary/10">
              <Camera className="w-3 h-3 mr-1" />
              Video Upload Available
            </Badge>

            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">WOUND ALERT</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Venous leg ulcer detected with moderate severity
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Nurse Notes</h4>
              <p className="text-sm text-muted-foreground">Pressure dressing applied.</p>
              <p className="text-sm text-muted-foreground">No signs of infection.</p>
            </div>

            <div className="pt-3 border-t border-cyan-400/50">
              <h4 className="text-sm font-semibold mb-2">All Updates</h4>
              <div className="space-y-2">
                {[
                  { text: "Pressure re-roged:", time: "9:3 AM" },
                  { text: "10 minutes pressure", time: "9:3 AM" },
                ].map((update, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{update.text}</span>
                    <span className="font-medium">{update.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Updates Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Recent Activity Log</h3>
          <div className="space-y-3">
            {[
              { time: "9:12 AM", activity: "NeoCam", icon: Camera },
              { time: "9 AM", activity: "WOUND AI DETECTION", icon: AlertTriangle },
              { time: "9 AM", activity: "Visit Details", icon: Clock },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <log.icon className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="font-medium text-sm">{log.activity}</span>
                </div>
                <span className="text-xs text-muted-foreground">{log.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Patient Care Summary</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-1">Total Visits This Week</p>
              <p className="text-2xl font-bold text-primary">12</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-1">Active Alerts</p>
              <p className="text-2xl font-bold text-warning">3</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-1">Pending Actions</p>
              <p className="text-2xl font-bold text-destructive">5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* All Updates Dialog */}
      <Dialog open={showAllUpdates} onOpenChange={setShowAllUpdates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Updates</DialogTitle>
            <DialogDescription>
              Complete history of all messages, medical updates, and system notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {allUpdates.map((update, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {update.type === "message" && <MessageSquare className="w-5 h-5 text-primary" />}
                    {update.type === "medical" && <AlertTriangle className="w-5 h-5 text-warning" />}
                    {update.type === "system" && <Clock className="w-5 h-5 text-muted-foreground" />}
                    <div>
                      <p className="font-semibold text-sm">{update.from}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            update.type === "message" ? "bg-primary/10 text-primary border-primary/30" :
                            update.type === "medical" ? "bg-warning/10 text-warning border-warning/30" :
                            "bg-muted text-muted-foreground border-muted-foreground/30"
                          }`}
                        >
                          {update.type === "message" ? "Message" : update.type === "medical" ? "Medical" : "System"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{update.time}</p>
                    <p className="text-xs text-muted-foreground">{update.date}</p>
                  </div>
                </div>
                {update.message && (
                  <p className="text-sm text-muted-foreground mt-2 pl-8">{update.message}</p>
                )}
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAllUpdates(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorFamilyPortal;
