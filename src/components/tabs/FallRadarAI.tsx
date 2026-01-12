import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, AlertTriangle, Bell, MapPin, Radio, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FallRadarAI = () => {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sensorData, setSensorData] = useState({
    location: {
      status: "Active",
      lastUpdate: "2 minutes ago",
      coordinates: "52.3676° N, 4.9041° E",
      accuracy: "±2 meters",
      deviceId: "LOC-2024-ET",
      battery: "85%"
    },
    radar: {
      status: "Active",
      lastPulse: "30 seconds ago",
      frequency: "24 GHz",
      range: "5 meters",
      sensitivity: "High",
      deviceId: "RAD-2024-ET",
      battery: "92%"
    },
    aiMonitor: {
      status: "Active",
      lastAnalysis: "15 seconds ago",
      aiModel: "FallRadar v2.1",
      confidence: "98.5%",
      alerts: 2,
      deviceId: "AIM-2024-ET",
      battery: "78%"
    }
  });

  const handleSensorClick = (sensor: string) => {
    setSelectedSensor(sensor);
  };

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">FallRadar AI</h2>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowNotifications(true)}>
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">3</Badge>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Client Overview */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-primary">Client Overview</h3>
          <div className="flex items-start gap-4">
            <img
              src="/images/pic 1.jpeg"
              alt="Ernest Turner - 75 year old man in wheelchair"
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="text-xl font-bold">Ernest Turner</h4>
              <p className="text-sm text-muted-foreground">75 years old</p>
              <p className="text-sm text-muted-foreground mt-1">COPD / Diabetes Type II</p>
              <Badge variant="destructive" className="mt-2">High Risk</Badge>
            </div>
          </div>
          <div className="pt-4 border-t border-cyan-400/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Assigned Nurse</span>
              <span className="font-medium">Carel Smith</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Visit</span>
              <span className="font-medium">Today at 14:15</span>
            </div>
          </div>
        </Card>

        {/* FallRadar Status */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">FallRadar Status</h3>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-muted" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div 
              className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20 cursor-pointer hover:bg-success/20 transition-colors"
              onClick={() => handleSensorClick('location')}
            >
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm flex-1">Location Sensor</span>
              <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/30">
                {sensorData.location.status}
              </Badge>
            </div>
            <div 
              className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20 cursor-pointer hover:bg-success/20 transition-colors"
              onClick={() => handleSensorClick('radar')}
            >
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm flex-1">Radar Pulse</span>
              <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/30">
                {sensorData.radar.status}
              </Badge>
            </div>
            <div 
              className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20 cursor-pointer hover:bg-success/20 transition-colors"
              onClick={() => handleSensorClick('aiMonitor')}
            >
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm flex-1">AI Monitor</span>
              <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/30">
                {sensorData.aiMonitor.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3">
            <div className="text-center">
              <MapPin className="w-6 h-6 mx-auto text-success mb-1" />
              <p className="text-xs text-muted-foreground">Location</p>
            </div>
            <div className="text-center">
              <Radio className="w-6 h-6 mx-auto text-success mb-1" />
              <p className="text-xs text-muted-foreground">Radar</p>
            </div>
            <div className="text-center">
              <Activity className="w-6 h-6 mx-auto text-success mb-1" />
              <p className="text-xs text-muted-foreground">AI Monitor</p>
            </div>
          </div>
        </Card>

        {/* FallAlert Status */}
        <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold text-primary">FallAlert Sent</h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden">
              <img
                src="/images/fall alert.png"
                alt="Fall Alert"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-center space-y-2">
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              Alert sent to be answered
            </Badge>
            <Button className="w-full mt-4 bg-success hover:bg-success/90">
              Mark as Resolved
            </Button>
          </div>
        </Card>
      </div>

      {/* Fall Event Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Fall Event Timeline</h3>
        <div className="relative rounded-lg overflow-hidden bg-muted/30 mb-4">
          <div className="aspect-video relative">
            <img
              src="/images/pic 2.jpeg?v=2"
              alt="Fall Event Video - Patient in wheelchair fall scenario"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur text-primary-foreground rounded-lg px-3 py-1">
              <span className="text-sm font-medium">06:53</span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm font-medium text-foreground">Safely Averted</span>
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-success/90 backdrop-blur rounded-lg px-3 py-1">
              <CheckCircle2 className="w-4 h-4 text-success-foreground" />
              <span className="text-xs text-success-foreground">Locally Rescued</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Fall History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Fall History</h3>
        <div className="space-y-3 mb-6">
          {[
            { date: "April 22, 2024", status: "Safely Averted", detail: "Recovered easily", color: "success" },
            { date: "April 9, 2024", status: "Increased Risk", detail: "Unsteady gait", color: "warning" },
            { date: "January 19, 2024", status: "Critical Aid", detail: "Emergency called", color: "destructive" },
            { date: "January 2024", status: "Emergency Care", detail: "Hospitalized", color: "destructive" },
          ].map((event, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
              <div className={`w-3 h-3 rounded-full ${
                event.color === "success" ? "bg-success" :
                event.color === "warning" ? "bg-warning" :
                "bg-destructive"
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{event.date}</span>
                  <span className="font-semibold">{event.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{event.detail}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">Fall Events Trend (Last 6 Months)</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={[
              { month: "Jan", events: 2, averted: 1 },
              { month: "Feb", events: 1, averted: 1 },
              { month: "Mar", events: 0, averted: 0 },
              { month: "Apr", events: 2, averted: 1 },
              { month: "May", events: 1, averted: 1 },
              { month: "Jun", events: 0, averted: 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px"
                }}
              />
              <Bar dataKey="events" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="averted" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Risk Factors & Recommendations */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Risk Factors Detected</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium">Balance & Stability</p>
                <p className="text-sm text-muted-foreground">Unstable stride detected</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">BuzzBand not worn</p>
                <p className="text-sm text-muted-foreground">Hanging on coat rack</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium">Home Hazard</p>
                <p className="text-sm text-muted-foreground">Corner rug lifts up</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Colored failline strips</p>
                <p className="text-sm text-muted-foreground">Install visual guides</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Chair position shift</p>
                <p className="text-sm text-muted-foreground">Improve ergonomics</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">BuzzBand Monitor</p>
                <p className="text-sm text-muted-foreground">Ensure daily wearing</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sensor Details Dialog */}
      <Dialog open={selectedSensor !== null} onOpenChange={() => setSelectedSensor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSensor === 'location' && 'Location Sensor Details'}
              {selectedSensor === 'radar' && 'Radar Pulse Details'}
              {selectedSensor === 'aiMonitor' && 'AI Monitor Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedSensor === 'location' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-bold text-success">{sensorData.location.status}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Last Update</p>
                  <p className="text-lg font-bold">{sensorData.location.lastUpdate}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="text-sm font-medium">{sensorData.location.coordinates}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-sm font-medium">{sensorData.location.accuracy}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Device ID</p>
                  <p className="text-sm font-medium">{sensorData.location.deviceId}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Battery</p>
                  <p className="text-lg font-bold text-success">{sensorData.location.battery}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-semibold mb-2">Current Location</h4>
                <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="w-12 h-12 text-primary mx-auto" />
                    <p className="text-sm font-medium">{sensorData.location.coordinates}</p>
                    <p className="text-xs text-muted-foreground">Home Address Verified</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedSensor === 'radar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-bold text-success">{sensorData.radar.status}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Last Pulse</p>
                  <p className="text-lg font-bold">{sensorData.radar.lastPulse}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="text-sm font-medium">{sensorData.radar.frequency}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Range</p>
                  <p className="text-sm font-medium">{sensorData.radar.range}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Sensitivity</p>
                  <p className="text-sm font-medium">{sensorData.radar.sensitivity}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Battery</p>
                  <p className="text-lg font-bold text-success">{sensorData.radar.battery}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-semibold mb-2">Radar Activity (Last Hour)</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={[
                    { time: "00:00", activity: 45 },
                    { time: "00:15", activity: 52 },
                    { time: "00:30", activity: 48 },
                    { time: "00:45", activity: 55 },
                    { time: "01:00", activity: 62 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
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
                      dataKey="activity" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {selectedSensor === 'aiMonitor' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-bold text-success">{sensorData.aiMonitor.status}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Last Analysis</p>
                  <p className="text-lg font-bold">{sensorData.aiMonitor.lastAnalysis}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">AI Model</p>
                  <p className="text-sm font-medium">{sensorData.aiMonitor.aiModel}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold text-primary">{sensorData.aiMonitor.confidence}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-lg font-bold text-warning">{sensorData.aiMonitor.alerts}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Battery</p>
                  <p className="text-lg font-bold text-success">{sensorData.aiMonitor.battery}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-semibold mb-2">AI Analysis Log</h4>
                <div className="space-y-2">
                  {[
                    { time: "15 seconds ago", event: "Movement pattern analyzed", risk: "Low" },
                    { time: "2 minutes ago", event: "Posture assessment completed", risk: "Normal" },
                    { time: "5 minutes ago", event: "Gait analysis performed", risk: "Low" },
                    { time: "10 minutes ago", event: "Balance check completed", risk: "Normal" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-card">
                      <div>
                        <p className="text-sm font-medium">{log.event}</p>
                        <p className="text-xs text-muted-foreground">{log.time}</p>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        {log.risk}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setSelectedSensor(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              FallRadar AI Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Active Alerts */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Alerts (3)
              </h3>
              {[
                {
                  id: 1,
                  type: "fall",
                  title: "Fall Alert Detected",
                  message: "Potential fall event detected at 14:23. Location sensor and radar pulse activated.",
                  time: "2 minutes ago",
                  severity: "high",
                  status: "active"
                },
                {
                  id: 2,
                  type: "risk",
                  title: "Increased Fall Risk",
                  message: "Unsteady gait pattern detected. Patient movement shows instability.",
                  time: "15 minutes ago",
                  severity: "medium",
                  status: "active"
                },
                {
                  id: 3,
                  type: "device",
                  title: "BuzzBand Not Worn",
                  message: "BuzzBand device not detected. Last seen on coat rack 1 hour ago.",
                  time: "1 hour ago",
                  severity: "medium",
                  status: "active"
                }
              ].map((notification) => (
                <Card key={notification.id} className="p-4 border-destructive/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">
                          {notification.severity === "high" ? "High Priority" : "Medium Priority"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* System Notifications */}
            <div className="space-y-3 pt-4 border-t border-cyan-400/50">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" />
                System Updates (5)
              </h3>
              {[
                {
                  id: 4,
                  type: "sensor",
                  title: "Location Sensor Status",
                  message: "Location sensor is operating normally. Last update: 2 minutes ago.",
                  time: "2 minutes ago",
                  status: "info"
                },
                {
                  id: 5,
                  type: "radar",
                  title: "Radar Pulse Active",
                  message: "Radar pulse system functioning at optimal levels. Range: 5 meters.",
                  time: "30 seconds ago",
                  status: "info"
                },
                {
                  id: 6,
                  type: "ai",
                  title: "AI Analysis Complete",
                  message: "AI Monitor completed movement pattern analysis. Confidence: 98.5%",
                  time: "15 seconds ago",
                  status: "info"
                },
                {
                  id: 7,
                  type: "battery",
                  title: "Device Battery Status",
                  message: "All devices have sufficient battery. Location: 85%, Radar: 92%, AI Monitor: 78%",
                  time: "5 minutes ago",
                  status: "info"
                },
                {
                  id: 8,
                  type: "safety",
                  title: "Safety Check Complete",
                  message: "Automated safety check completed. No immediate concerns detected.",
                  time: "10 minutes ago",
                  status: "info"
                }
              ].map((notification) => (
                <Card key={notification.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                          {notification.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Historical Alerts */}
            <div className="space-y-3 pt-4 border-t border-cyan-400/50">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent History (3)
              </h3>
              {[
                {
                  id: 9,
                  title: "Fall Safely Averted",
                  message: "Fall event detected and safely averted on April 22, 2024 at 06:53",
                  time: "April 22, 2024",
                  status: "resolved"
                },
                {
                  id: 10,
                  title: "Increased Risk Detected",
                  message: "Unsteady gait pattern detected on April 9, 2024. Patient recovered easily.",
                  time: "April 9, 2024",
                  status: "resolved"
                },
                {
                  id: 11,
                  title: "Emergency Response",
                  message: "Critical fall event on January 19, 2024. Emergency services called.",
                  time: "January 19, 2024",
                  status: "resolved"
                }
              ].map((notification) => (
                <Card key={notification.id} className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                          RESOLVED
                        </Badge>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-cyan-400/50">
            <Button onClick={() => setShowNotifications(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FallRadarAI;
