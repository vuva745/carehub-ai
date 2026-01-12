import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LogOut } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const HouseholdHelp = () => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const clients = [
    {
      name: "Joost Vos",
      home: "House",
      time: "10.30-11.30",
      tasks: ["Vacuuming", "Laundry", "Trash Removal"],
      notes: "Client has a cat",
      aide: "Emma",
      clientPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      aidePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Sanne",
      home: "Apartment",
      time: "13.30-14.00",
      tasks: ["Cleaning Kitchen"],
      notes: "Change bed linens",
      aide: "Anne",
      clientPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      aidePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Antoine",
      home: "Apartment",
      time: "14.30-15.00",
      tasks: ["Shopping"],
      notes: "—",
      aide: "Laura",
      clientPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      aidePhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Ingrid Post",
      home: "House",
      time: "15.50-16.00",
      tasks: ["Dusting", "Cleaning Floors"],
      notes: "Top up supplies",
      aide: "Esther",
      clientPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      aidePhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Willem Jaco",
      home: "House",
      time: "16.00-16.00",
      tasks: ["Cleaning", "Dusting"],
      notes: "Client has limited mobility",
      aide: "Tim",
      clientPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      aidePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Rita Hendriks",
      home: "Apartment",
      time: "16.10-17.00",
      tasks: ["Cleaning Floors"],
      notes: "—",
      aide: "Carol",
      clientPhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face",
      aidePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Rita Herdriks",
      home: "House",
      time: "15.00-16.00",
      tasks: ["Clean firors"],
      notes: "—",
      aide: "Carol",
      clientPhoto: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face",
      aidePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 bg-secondary/20 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Household Help</h2>
        </div>
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowUpdateDialog(true)}>UPDATE</Button>
              <Button variant="outline" onClick={() => setShowLogoutDialog(true)}>
                <LogOut className="w-4 h-4 mr-2" />
                LOGOUT
              </Button>
            </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search clients"
          className="pl-10 bg-background"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card border-b-2 border-border">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-foreground">CLIENT</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">HOME</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">HELP TIME</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">TASKS</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">NOTES</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">ASSIGNED AIDE</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/30">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={client.clientPhoto}
                        alt={client.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">{client.home}</td>
                  <td className="py-4 px-6">{client.time}</td>
                  <td className="py-4 px-6">
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {client.tasks.map((task, j) => (
                        <li key={j}>{task}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">{client.notes}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <img
                        src={client.aidePhoto}
                        alt={client.aide}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium">{client.aide}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Household Help Schedule</DialogTitle>
            <DialogDescription>
              Update the schedule or assignments for household help services
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="updateType">Update Type</Label>
              <select
                id="updateType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="schedule">Schedule Change</option>
                <option value="assignment">Assignment Change</option>
                <option value="task">Task Update</option>
                <option value="notes">Notes Update</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="updateMessage">Update Details</Label>
              <Textarea
                id="updateMessage"
                placeholder="Enter update details..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-1">Affected Clients</p>
              <p className="text-xs text-muted-foreground">
                {clients.length} client(s) will be affected by this update
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUpdateDialog(false);
              setUpdateMessage("");
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsUpdating(true);
                // Simulate update process
                setTimeout(() => {
                  setIsUpdating(false);
                  setShowUpdateDialog(false);
                  setUpdateMessage("");
                  alert("Household help schedule updated successfully!");
                }, 1500);
              }}
              disabled={isUpdating || !updateMessage.trim()}
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout from the Household Help system?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-2">You will be logged out from:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Household Help Dashboard</li>
                <li>Client Management</li>
                <li>Schedule Management</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                // Simulate logout
                alert("You have been logged out successfully. Redirecting to login page...");
                setShowLogoutDialog(false);
                // In a real app, this would redirect to login
                // window.location.href = '/login';
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HouseholdHelp;
