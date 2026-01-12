import { Mic, Lock, Shield, CheckCircle, Clock, MapPin, Volume2, Download, Send, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ExportButton } from "@/components/shared/ExportButton";
import { generateVoiceSloganData } from "@/lib/exportUtils";
import { renderTab14_1Model, validateVoiceSloganText, bindCareGoal } from "@/lib/neocare-ai/tab14-1-script";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const voiceSlogans = [
  { time: "09:14", careGoal: "Medication", sponsor: "Kenya Life", proof: true },
  { time: "08:42", careGoal: "Fall Prevention", sponsor: "Kenya Life", proof: true },
  { time: "08:10", careGoal: "Nutrition", sponsor: null, proof: true },
];

export function Tab14_1VoiceSlogans() {
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [careGoalId, setCareGoalId] = useState("");
  const [submissionState, setSubmissionState] = useState("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = renderTab14_1Model({ state: submissionState });
        setModel(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [submissionState]);

  const handleSubmit = () => {
    // Validate text
    const textValidation = validateVoiceSloganText(text);
    if (!textValidation.valid) {
      setValidationError(textValidation.error || "Validation failed");
      toast({
        title: "Validation Error",
        description: textValidation.error === "TEXT_TOO_SHORT" ? "Text must be at least 3 characters" :
                     textValidation.error === "TEXT_TOO_LONG" ? "Text must be less than 240 characters" :
                     "Please check your input",
        variant: "destructive"
      });
      return;
    }

    // Bind care goal
    const goalBinding = bindCareGoal({ text, careGoalId });
    if (!goalBinding.valid) {
      setValidationError(goalBinding.error || "Care goal required");
      toast({
        title: "Care Goal Required",
        description: "Please select a care goal",
        variant: "destructive"
      });
      return;
    }

    setValidationError(null);
    setSubmissionState("loading");

    // Simulate submission
    setTimeout(() => {
      setSubmissionState("success");
      toast({
        title: "VoiceSlogan Logged",
        description: "Your VoiceSlogan has been successfully logged with 7D Proof",
      });
      setText("");
      setCareGoalId("");
      
      // Reload model with updated data
      const updatedModel = renderTab14_1Model({ state: "idle" });
      setModel(updatedModel);
      
      setTimeout(() => setSubmissionState("idle"), 2000);
    }, 1500);
  };

  if (loading) return <div className="p-10 text-center text-purple-500">Loading VoiceSlogan...</div>;

  const data = model || {};

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-100/30 dark:from-purple-950/20 dark:via-background dark:to-background min-h-full border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent tracking-wide">
            {data.title || "Live Voice Slogans"}
          </h1>
          <p className="text-purple-600/80 dark:text-purple-400/80 text-lg tracking-wide">Real-time client feedback slogans</p>
          {data.disclaimer && (
            <p className="text-xs text-muted-foreground italic mt-1">{data.disclaimer}</p>
          )}
          <p className="text-muted-foreground flex items-center gap-2 mt-2">
            Verified with <span className="font-semibold">7D Proof</span> <Lock className="w-4 h-4" />
          </p>
        </div>
        <ExportButton
          label="Export Voice Slogans"
          options={[
            { label: "Export as PDF", format: "pdf" },
            { label: "Export as Word", format: "word" },
            { label: "Export as CSV", format: "csv" }
          ]}
          data={generateVoiceSloganData()}
          pdfTitle="Live Voice Slogans Report"
          filename="voice-slogans-report"
        />
      </div>

      {/* Sponsor Card */}
      {data.sponsorCard && (
        <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/images/insurance.png"
                  alt="Kenya Life Insurance"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sponsor</p>
                  <p className="font-semibold text-lg">{data.sponsorCard.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{data.sponsorCard.dailyCount}</p>
                <p className="text-xs text-muted-foreground">Daily Count</p>
                {data.sponsorCard.lastActivityUtc !== "-" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last: {new Date(data.sponsorCard.lastActivityUtc).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Form */}
      <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <CardHeader>
          <CardTitle className="text-lg">Submit VoiceSlogan Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voice-text">VoiceSlogan Text</Label>
            <Textarea
              id="voice-text"
              placeholder={data.input?.textPlaceholder || "Enter VoiceSlogan (text)…"}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setValidationError(null);
              }}
              className="min-h-[100px]"
              maxLength={240}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{text.length} / 240 characters</span>
              {validationError && (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationError}
                </span>
              )}
            </div>
          </div>

          {data.input?.careGoalRequired && (
            <div className="space-y-2">
              <Label htmlFor="care-goal">Care Goal {data.input.careGoalRequired && <span className="text-destructive">*</span>}</Label>
              <Select value={careGoalId} onValueChange={setCareGoalId}>
                <SelectTrigger id="care-goal">
                  <SelectValue placeholder="Select a care goal" />
                </SelectTrigger>
                <SelectContent>
                  {data.input?.careGoals?.map((goal: any) => (
                    <SelectItem key={goal.id} value={goal.id}>{goal.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge className={
              data.submissionState?.color === "green" ? "bg-success/20 text-success border-success/30" :
              data.submissionState?.color === "red" ? "bg-destructive/20 text-destructive border-destructive/30" :
              data.submissionState?.color === "blue" ? "bg-info/20 text-info border-info/30" :
              "bg-muted"
            }>
              {data.submissionState?.label || "Idle"}
            </Badge>
            <Button
              onClick={handleSubmit}
              disabled={submissionState === "loading" || !text.trim() || !careGoalId}
              className="gap-2"
            >
              {submissionState === "loading" ? (
                <>Submitting…</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit VoiceSlogan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Voice Card */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm overflow-hidden border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] shadow-purple-500/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Care Goal Content */}
                <div className="flex-1 space-y-4">
                  <Badge className="bg-purple-100/50 text-purple-700 border-purple-200/50 px-4 py-1.5 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                    Care Goal: Medication Adherence
                  </Badge>

                  <div>
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2 drop-shadow-[0_0_2px_rgba(168,85,247,0.5)]">
                      "Make sure you take your meds, it keeps you strong!"
                    </h3>
                    <p className="text-purple-800/70 dark:text-purple-300/70 italic">
                      — Spoken by Mrs. Jansen during morning visit
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generated from verified voice input
                  </p>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Sponsor</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/insurance.png"
                          alt="Kenya Life Insurance"
                          className="w-16 h-16 object-contain"
                        />
                        <div>
                          <p className="font-semibold text-primary">KENYA LIFE</p>
                          <p className="text-xs text-muted-foreground">INSURANCE</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p>Time: <span className="font-medium">09:14</span></p>
                        <p>Location: <span className="font-medium">Home Care</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Care Context</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <CheckCircle className="w-4 h-4 text-success" />
                      <Badge className="bg-success/20 text-success border-success/30">Sponsor Active</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 00:37 ago
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Logged with 7D Proof · Time · Location · Care Moment · Voice Hash</span>
                  </div>
                </div>

                {/* Right: Voice Counter with Neon Glow */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    {/* Outer glow rings */}
                    <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-purple-500/40 via-violet-500/30 to-purple-400/20 blur-xl animate-pulse" />
                    <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-purple-400/30 via-violet-400/20 to-purple-300/10 blur-lg" />
                    {/* Main circle */}
                    <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-purple-500/50 via-violet-500/40 to-purple-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] animate-pulse">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/60 via-violet-600/50 to-purple-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-700/80 to-violet-700/70 flex flex-col items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.7)]">
                          <span className="text-4xl font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">214</span>
                          <span className="text-xs text-center leading-tight drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Human Voices<br />Today</span>
                        </div>
                      </div>
                    </div>
                    {/* Animated border */}
                    <div className="absolute -inset-4 rounded-full border-2 border-purple-400/40 animate-pulse" />
                    <div className="absolute -inset-5 rounded-full border border-purple-300/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats with Neon Glow */}
        <div className="space-y-4">
          <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
            <CardContent className="p-5 text-center">
              <Volume2 className="w-10 h-10 mx-auto text-purple-600 mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">214</p>
              <p className="text-sm text-muted-foreground">Voice Slogans Today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
            <CardContent className="p-5 text-center">
              <Shield className="w-10 h-10 mx-auto text-green-500 mb-2 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">100%</p>
              <p className="text-sm text-muted-foreground">7D Proof Verified</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all">
            <CardContent className="p-5 text-center">
              <MapPin className="w-10 h-10 mx-auto text-blue-500 mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">12</p>
              <p className="text-sm text-muted-foreground">Care Locations</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voice Slogan Log */}
      <Card className="bg-white/60 dark:bg-background/60 backdrop-blur-sm border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-3">
              VoiceSlogan Log
              <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                <Volume2 className="w-4 h-4" />
                Recent slogans: <span className="font-semibold text-foreground">{data.list?.length || 0}</span>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {data.list && data.list.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Text</TableHead>
                  <TableHead>Care Goal</TableHead>
                  <TableHead>Sponsor</TableHead>
                  <TableHead className="text-center">Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.list.map((slogan: any, i: number) => {
                  const date = slogan.timestampUtc ? new Date(slogan.timestampUtc) : null;
                  const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : "";
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{timeStr}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm truncate">{slogan.text}</p>
                      </TableCell>
                      <TableCell>{slogan.careGoal}</TableCell>
                      <TableCell>
                        {slogan.sponsorTag ? (
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-success" />
                            <span className="text-xs">{slogan.sponsorTag}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          slogan.proof?.badge?.includes("Logged") 
                            ? "bg-success/20 text-success border-success/30" 
                            : "bg-muted text-muted-foreground"
                        }>
                          {slogan.proof?.badge || "Pending"}
                        </Badge>
                        {slogan.proof?.proofIdShort && (
                          <p className="text-xs text-muted-foreground mt-1">{slogan.proof.proofIdShort}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No VoiceSlogans logged yet.</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            <Lock className="w-3 h-3" />
            <span>Text-only confirmation. No audio. No medical analysis. All entries logged with 7D Proof.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
