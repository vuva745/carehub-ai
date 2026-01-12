import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Video, CheckCircle2, Clock, User, X, FileVideo, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CareTVSync = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoNotes, setVideoNotes] = useState("");
  const [selectedNurse, setSelectedNurse] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recentUploads, setRecentUploads] = useState([
    { id: "Care #1256", nurse: "Petra van Dijk", client: "Theo Visser", status: "PENDING" },
    { id: "Care #1255", nurse: "Maria Jansen", client: "Jan Smit", status: "UPLOADED" },
    { id: "Care #1254", nurse: "Ibrahim Salah", client: "Hennie de Boe", status: "UPLOADED" },
    { id: "Care #1253", nurse: "Linda Vos", client: "Karin Vermulen", status: "UPLOADED" }
  ]);

  const nurses = ["Petra van Dijk", "Maria Jansen", "Ibrahim Salah", "Linda Vos", "Sarah Johnson", "Emma Wilson"];
  const clients = ["Theo Visser", "Jan Smit", "Hennie de Boe", "Karin Vermulen", "John Doe", "Jane Smith"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setUploadComplete(false);
        setUploadProgress(0);
      } else {
        alert("Please select a video file.");
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a video file to upload.");
      return;
    }
    if (!selectedNurse || !selectedClient) {
      alert("Please select both nurse and client.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          setUploadComplete(true);
          
          // Add to recent uploads
          const newUpload = {
            id: `Care #${1257 + recentUploads.length}`,
            nurse: selectedNurse,
            client: selectedClient,
            status: "UPLOADED" as const
          };
          setRecentUploads([newUpload, ...recentUploads]);
          
          // Reset form after 2 seconds
          setTimeout(() => {
            setShowUploadDialog(false);
            setSelectedFile(null);
            setVideoNotes("");
            setSelectedNurse("");
            setSelectedClient("");
            setUploadComplete(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }, 2000);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleCloseDialog = () => {
    if (!isUploading) {
      setShowUploadDialog(false);
      setSelectedFile(null);
      setVideoNotes("");
      setSelectedNurse("");
      setSelectedClient("");
      setUploadComplete(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 bg-muted/20 border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold text-foreground">CareTV Sync (Video Uploads)</h2>
      </div>

      {/* Upload Section */}
      <Card className="p-8 bg-primary/5">
        <Button 
          size="lg" 
          className="w-full h-24 text-2xl font-bold bg-primary hover:bg-primary/90"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="w-8 h-8 mr-3" />
          UPLOAD VIDEO
        </Button>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 text-center border-l-4 border-warning">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-6 h-6 text-warning" />
            <h3 className="text-lg font-semibold text-muted-foreground">Pending Uploads</h3>
          </div>
          <p className="text-6xl font-bold">14</p>
        </Card>

        <Card className="p-6 text-center border-l-4 border-primary">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Video className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-muted-foreground">Uploading</h3>
          </div>
          <p className="text-6xl font-bold">3</p>
          <p className="text-sm text-muted-foreground mt-2">Videos</p>
        </Card>

        <Card className="p-6 text-center border-l-4 border-success">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <h3 className="text-lg font-semibold text-muted-foreground">Completed</h3>
          </div>
          <p className="text-6xl font-bold">1224</p>
        </Card>
      </div>

      {/* Recent Uploads Table */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold text-foreground mb-6">Recent Uploads</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-border">
              <tr>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Care Video</th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Nurse</th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Client</th>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUploads.map((upload, i) => (
                <tr key={i} className="border-b border-cyan-400/50 hover:bg-muted/30">
                  <td className="py-4 px-4 font-medium text-lg">{upload.id}</td>
                  <td className="py-4 px-4">{upload.nurse}</td>
                  <td className="py-4 px-4">{upload.client}</td>
                  <td className="py-4 px-4">
                    <Badge 
                      variant="outline"
                      className={upload.status === "PENDING" 
                        ? "bg-muted text-muted-foreground border-muted-foreground/30"
                        : "bg-success/10 text-success border-success/30"
                      }
                    >
                      {upload.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Suggestions */}
      <Card className="p-6 bg-card">
        <h3 className="text-xl font-bold text-foreground mb-4">AI Suggestions</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-primary text-xl">•</span>
            <span className="text-muted-foreground">Ensure proper lighting</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary text-xl">•</span>
            <span className="text-muted-foreground">Avoid excessive noise</span>
          </li>
        </ul>
      </Card>

      {/* Upload Video Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Upload Care Video
            </DialogTitle>
            <DialogDescription>
              Upload a care session video to CareTV Sync. Videos are automatically logged with timestamps and metadata.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Selection */}
            <div className="space-y-2">
              <Label htmlFor="video-file">Select Video File</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="video-file"
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                  disabled={isUploading}
                />
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileVideo className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supported formats: MP4, MOV, AVI, MKV (Max 500MB)
              </p>
            </div>

            {/* Nurse Selection */}
            <div className="grid gap-2">
              <Label htmlFor="nurse-select">Nurse</Label>
              <Select value={selectedNurse} onValueChange={setSelectedNurse} disabled={isUploading}>
                <SelectTrigger id="nurse-select">
                  <SelectValue placeholder="Select nurse" />
                </SelectTrigger>
                <SelectContent>
                  {nurses.map((nurse) => (
                    <SelectItem key={nurse} value={nurse}>
                      {nurse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Selection */}
            <div className="grid gap-2">
              <Label htmlFor="client-select">Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient} disabled={isUploading}>
                <SelectTrigger id="client-select">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="video-notes">Notes (Optional)</Label>
              <Textarea
                id="video-notes"
                placeholder="Add any notes about this care video..."
                value={videoNotes}
                onChange={(e) => setVideoNotes(e.target.value)}
                rows={3}
                disabled={isUploading}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Complete */}
            {uploadComplete && (
              <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-success">Upload Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    Video has been uploaded and added to recent uploads.
                  </p>
                </div>
              </div>
            )}

            {/* Auto-Logging Info */}
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium mb-1">7D-Proof Auto-Logging</p>
              <p className="text-xs text-muted-foreground">
                This video will be automatically logged with timestamp, location, device sync information, and care session metadata.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isUploading}>
              {uploadComplete ? "Close" : "Cancel"}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedNurse || !selectedClient || isUploading || uploadComplete}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : uploadComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Uploaded
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareTVSync;
