import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Navigation, User, Calendar, ChevronRight, MessageSquare, ToggleLeft, ToggleRight, Shield, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RequestLog {
  id: string;
  type: "Cancel" | "Reschedule" | "Extra Care";
  message: string;
  time: string;
}

const PlanningRoutes = () => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showExtraCareDialog, setShowExtraCareDialog] = useState(false);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([
    { id: "1", type: "Reschedule", message: "Client rescheduled visit from 09:00 to 13:00", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  // Form states
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [originalTime, setOriginalTime] = useState("");
  const [extraCareType, setExtraCareType] = useState("");
  const [extraCareNotes, setExtraCareNotes] = useState("");

  const handleCancelVisit = () => {
    if (cancelReason.trim()) {
      const newLog: RequestLog = {
        id: Date.now().toString(),
        type: "Cancel",
        message: `Client requested to cancel visit. Reason: ${cancelReason}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setRequestLogs([newLog, ...requestLogs]);
      setCancelReason("");
      setShowCancelDialog(false);
    }
  };

  const handleReschedule = () => {
    if (rescheduleDate && rescheduleTime && originalTime) {
      const newLog: RequestLog = {
        id: Date.now().toString(),
        type: "Reschedule",
        message: `Client rescheduled visit from ${originalTime} to ${rescheduleTime}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setRequestLogs([newLog, ...requestLogs]);
      setRescheduleDate("");
      setRescheduleTime("");
      setOriginalTime("");
      setShowRescheduleDialog(false);
    }
  };

  const handleExtraCare = () => {
    if (extraCareType.trim()) {
      const newLog: RequestLog = {
        id: Date.now().toString(),
        type: "Extra Care",
        message: `Client requested extra care: ${extraCareType}${extraCareNotes ? `. Notes: ${extraCareNotes}` : ''}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setRequestLogs([newLog, ...requestLogs]);
      setExtraCareType("");
      setExtraCareNotes("");
      setShowExtraCareDialog(false);
    }
  };

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-purple-400/50 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.5)] shadow-purple-400/50 min-w-0 bg-gradient-to-br from-purple-50/30 via-purple-100/20 to-violet-100/10 dark:from-purple-950/20 dark:via-background dark:to-background">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">Planning & AI Visits</h2>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all">
          <Navigation className="w-4 h-4 mr-2" />
          Route Optimization
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 border-t border-purple-400/30 pt-6">
        {/* Client Info */}
        <Card className="p-6 space-y-4 border border-purple-300/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Client</h3>
            <Badge variant="outline" className="text-xs border-purple-300/50 bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-[0_0_5px_rgba(168,85,247,0.3)]">Active</Badge>
          </div>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
              alt="Sharon Weston"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h4 className="text-2xl font-bold">Sharon Weston</h4>
              <p className="text-muted-foreground">Age 35</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-purple-400/50 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Assigned Nurse</span>
              <span className="text-sm font-medium">Emma Nolan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Shift</span>
              <span className="text-sm font-medium">14:30 - 14:30</span>
            </div>
          </div>

          <div className="pt-4 border-t border-purple-400/50">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-100/50 dark:bg-purple-900/30 border border-purple-200/50">
              <Clock className="w-5 h-5 text-purple-700 dark:text-purple-300" />
              <div className="flex-1">
                <p className="text-sm font-medium">Next Visit</p>
                <p className="text-lg font-bold">14:30 - 21:30</p>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-muted border border-purple-300/30 shadow-[0_0_5px_rgba(168,85,247,0.2)]">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">0:5m</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">0 min delay</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Map Visualization */}
        <Card className="col-span-2 p-6 bg-muted/30 border border-purple-300/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden border-2 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <img
              src="/images/blocks.jpeg"
              alt="Route Map"
              className="w-full h-full object-cover"
            />
            
            {/* Dotted Orange Line connecting the markers */}
            <svg className="absolute inset-0 w-full h-full z-10" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 56 336 L 536 80"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeDasharray="8 4"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Start Marker - Dark Blue Circular with "E" */}
            <div className="absolute bottom-8 left-8 w-14 h-14 rounded-full bg-[#1e40af] flex items-center justify-center text-white font-bold text-lg shadow-xl z-20 border-2 border-white">
              E
            </div>
            
            {/* End Marker - Light Blue Square with House Icon "A" */}
            <div className="absolute top-20 right-20 w-14 h-14 rounded-lg bg-[#60a5fa] flex items-center justify-center text-white font-bold text-lg shadow-xl z-20 border-2 border-white">
              <div className="flex flex-col items-center">
                <svg className="w-6 h-6 mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="text-xs">A</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* New 3-Column Layout */}
      <div className="grid grid-cols-3 gap-6 border-t border-purple-400/30 pt-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* NURSE Card */}
          <Card className="p-4 border border-purple-300/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">NURSE</h3>
            <div className="flex items-center gap-3">
              <img
                src="/images/nurse (1).png"
                alt="Nurse"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">Nurse ID 041</p>
              </div>
            </div>
          </Card>

          {/* AI ROUT PLAN Card */}
          <Card className="p-4 border border-purple-300/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">AI ROUT PLAN</h3>
            <div className="space-y-2">
              {[
                { number: "30", client: "Sarah Willems", duration: "90 min" },
                { number: "55", client: "James Otieno", duration: "55 min" },
                { number: "90", client: "Esther Kamau", duration: "99 min" },
              ].map((route, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted hover:bg-muted/80 border border-purple-300/30 hover:border-purple-400/50 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-700 dark:text-purple-300">{route.number}</span>
                    <span className="text-sm">{route.client}</span>
                    <span className="text-sm text-muted-foreground">&gt; {route.duration}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              ))}
            </div>
          </Card>

          {/* KENYA LIFE INSURANCE Card */}
          <Card className="p-4 border border-purple-300/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
            <div className="flex items-center gap-3">
              <img
                src="/images/insurance.png"
                alt="Insurance"
                className="w-16 h-16 object-contain"
              />
              <div>
                <p className="text-sm font-semibold">KENYA LIFE INSURANCE</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="space-y-4">
          {/* VISITS TODAY Card - Requests */}
          <Card className="p-4 border border-purple-300/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">VISITS TODAY</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel visit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all"
                  onClick={() => setShowRescheduleDialog(true)}
                >
                  Reschedule
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs border-purple-300/50 hover:border-purple-400/70 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all"
                  onClick={() => setShowExtraCareDialog(true)}
                >
                  Extra care
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {requestLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-muted border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm flex-1">{log.message}</p>
                      <Badge variant="outline" className="bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300/50 text-xs whitespace-nowrap shadow-[0_0_5px_rgba(168,85,247,0.3)]">
                        {log.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">at {log.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* AI AUTO-REPORTING Card */}
          <Card className="p-4 border border-purple-300/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">AI AUTO-REPORTING</h3>
              <div className="flex items-center gap-2">
                <ToggleRight className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium">ON</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                "ADL started/finished",
                "Medication taken/missed",
                "Wound care done",
                "Client refused care",
              ].map((item, i) => (
                <div key={i} className="text-sm p-2 rounded bg-muted/50 border border-purple-300/30 hover:border-purple-400/50 hover:shadow-[0_0_5px_rgba(168,85,247,0.2)] transition-all">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          {/* FAMILY NOTIFICATION Card - Metrics */}
          <Card className="p-4 border border-purple-300/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">FAMILY NOTIFICATION</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded border border-purple-300/30 hover:border-purple-400/50 hover:shadow-[0_0_5px_rgba(168,85,247,0.2)] transition-all">
                <span className="text-sm">7 Care moments</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded border border-purple-300/30 hover:border-purple-400/50 hover:shadow-[0_0_5px_rgba(168,85,247,0.2)] transition-all">
                <span className="text-sm">12 Clips recorded</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded border border-purple-300/30 hover:border-purple-400/50 hover:shadow-[0_0_5px_rgba(168,85,247,0.2)] transition-all">
                <span className="text-sm">178 Voice slogans</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* VISITS TODAY Card - Table */}
          <Card className="p-4 border border-purple-300/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">VISITS TODAY</h3>
            <div className="space-y-2">
              {[
                { client: "Sarah Willems", type: "ADL", hasArrow: true },
                { client: "James Otieno", type: "Medication", hasArrow: false },
                { client: "Jane Mugo", type: "Wound Care", hasArrow: false },
                { client: "James Otieno", type: "ADL", hasArrow: true },
              ].map((visit, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted hover:bg-muted/80 border border-purple-300/30 hover:border-purple-400/50 hover:shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{visit.client}</span>
                    <span className="text-sm text-purple-600 dark:text-purple-400">{visit.type}</span>
                  </div>
                  {visit.hasArrow && <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                </div>
              ))}
            </div>
          </Card>

          {/* FAMILY NOTIFICATION Card - Messages */}
          <Card className="p-4 border border-purple-300/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">FAMILY NOTIFICATION</h3>
            <div className="space-y-3">
              {[
                "Your mother's medication visit was completed",
                "The wound care appointment has started",
              ].map((message, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <MessageSquare className="w-4 h-4 text-purple-700 dark:text-purple-300 mt-0.5" />
                  <p className="text-sm flex-1">{message}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* SPONSOR Text */}
          <div className="pt-2 border-t border-purple-400/30">
            <p className="text-sm font-bold uppercase text-purple-700 dark:text-purple-300 drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]">SPONSOR</p>
          </div>
        </div>
      </div>

      {/* Cancel Visit Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[500px] border-2 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
          <DialogHeader>
            <DialogTitle>Cancel Visit</DialogTitle>
            <DialogDescription>
              Please provide a reason for canceling this visit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCancelDialog(false);
              setCancelReason("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleCancelVisit} disabled={!cancelReason.trim()} className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)]">
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Visit Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="sm:max-w-[500px] border-2 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
          <DialogHeader>
            <DialogTitle>Reschedule Visit</DialogTitle>
            <DialogDescription>
              Select a new date and time for this visit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="original-time">Current Visit Time</Label>
              <Input
                id="original-time"
                type="time"
                value={originalTime}
                onChange={(e) => setOriginalTime(e.target.value)}
                placeholder="09:00"
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-date">New Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-time">New Time</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRescheduleDialog(false);
              setRescheduleDate("");
              setRescheduleTime("");
              setOriginalTime("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={!rescheduleDate || !rescheduleTime || !originalTime} className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)]">
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extra Care Dialog */}
      <Dialog open={showExtraCareDialog} onOpenChange={setShowExtraCareDialog}>
        <DialogContent className="sm:max-w-[500px] border-2 border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
          <DialogHeader>
            <DialogTitle>Request Extra Care</DialogTitle>
            <DialogDescription>
              Select the type of extra care needed and provide additional details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="care-type">Type of Extra Care</Label>
              <Select value={extraCareType} onValueChange={setExtraCareType}>
                <SelectTrigger id="care-type" className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                  <SelectValue placeholder="Select care type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wound Care">Wound Care</SelectItem>
                  <SelectItem value="Medication Assistance">Medication Assistance</SelectItem>
                  <SelectItem value="ADL Support">ADL Support</SelectItem>
                  <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                  <SelectItem value="Emotional Support">Emotional Support</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="care-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="care-notes"
                placeholder="Provide any additional details about the extra care request..."
                value={extraCareNotes}
                onChange={(e) => setExtraCareNotes(e.target.value)}
                rows={4}
                className="border-purple-300/50 focus:border-purple-400 focus:ring-purple-400/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowExtraCareDialog(false);
              setExtraCareType("");
              setExtraCareNotes("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleExtraCare} disabled={!extraCareType.trim()} className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)]">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningRoutes;
