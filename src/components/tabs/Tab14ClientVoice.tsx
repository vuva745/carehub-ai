import { Lock, Bell, Heart, MessageSquare, Users, ChevronRight, CheckCircle, Calendar as CalendarIcon, Leaf, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButton } from "@/components/shared/ExportButton";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

import activityImg from "@/assets/activities-leisure.png";
import { runTab14LikelihoodAnalysis } from "@/lib/neocare-ai/tab14-script";
import { generateClientVoiceData } from "@/lib/exportUtils";
import { useEffect, useState, useCallback, useRef } from "react";

const sentimentData = [
  { week: "Week 1", score: 7.2 },
  { week: "Week 2", score: 7.8 },
  { week: "Week 3", score: 8.2 },
  { week: "Week 4", score: 8.6 },
];

const alerts = [
  { id: 1, icon: Bell, text: "Peter V. reported walking pain marked as urgent", type: "urgent" as const },
  { id: 2, icon: Heart, text: "Mia J. appreciated the same nurse", type: "positive" as const },
  { id: 3, icon: MessageSquare, text: "Medical query: Would like to talk", type: "info" as const },
  { id: 4, icon: Users, text: "New walking club started!", type: "positive" as const },
];

const upcomingMeetings = [
  { id: 1, title: "Care Plan Review", time: "Tomorrow, 10:00 AM", attendees: ["Dr. Smith", "Lisa R.", "Family"] },
  { id: 2, title: "Physical Therapy check-in", time: "Thu, 2:00 PM", attendees: ["PT Sarah", "Lisa R."] },
];

const activityEvents = [
  { id: 1, title: "Community Garden Walk", time: "Today, 4:00 PM", type: "Social" },
  { id: 2, title: "Art Therapy Class", time: "Wed, 11:00 AM", type: "Creative" },
];

// Trigger HMR update
export function Tab14ClientVoice() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<string | null>(null);
  const [surveyStep, setSurveyStep] = useState(0);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimeRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock Survey Questions
  const surveyQuestions: any = {
    "Daily Wellbeing Check": [
      { q: "How is your energy level today?", type: "scale" },
      { q: "Have you eaten all your meals?", type: "yesno" },
      { q: "Any new discomfort?", type: "boolean" }
    ],
    "Pain Assessment": [
      { q: "Rate your current pain level (0-10)", type: "scale" },
      { q: "Where is the pain located?", type: "text" }
    ]
  };

  useEffect(() => {
    async function load() {
      try {
        const result = await runTab14LikelihoodAnalysis("C-123");
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else if (typeof (mediaRecorderRef.current as any).stop === 'function') {
        // Handle simulated recording stop
        (mediaRecorderRef.current as any).stop();
      }
      setIsRecording(false);
    }
    // Clean up stream if still active
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;
          if (newTime >= 10) {
            stopRecording();
            return 10;
          }
          return newTime;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
      recordingTimeRef.current = 0;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Helper function to create a silent WAV file
  const createSilentAudio = (durationSeconds: number): Blob => {
    const sampleRate = 44100;
    const numSamples = sampleRate * durationSeconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Silent audio (zeros)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Save audio blob to file
  const saveRecording = (audioBlob: Blob, duration: number) => {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.download = `voice-feedback-${timestamp}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Recording saved:', audioBlob.size, 'bytes');
    toast({
      title: "Recording Saved",
      description: `Successfully saved ${duration} seconds of audio feedback.`,
    });
  };

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    setAudioChunks([]);

    let useRealMicrophone = false;
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    let mimeType = 'audio/webm';
    const chunks: Blob[] = [];

    // Try to access microphone, but don't require it
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        useRealMicrophone = true;

        // Determine best MIME type
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          } else {
            mimeType = '';
          }
        }

        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onerror = () => {
          useRealMicrophone = false;
        };

        recorder.onstop = () => {
          setIsRecording(false);
          const finalTime = recordingTimeRef.current || 10;
          let audioBlob: Blob;
          
          if (chunks.length > 0) {
            audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
          } else {
            // Fallback to silent audio
            audioBlob = createSilentAudio(finalTime);
          }
          
          setAudioChunks([audioBlob]);
          saveRecording(audioBlob, finalTime);
          
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          handleAction("Voice Recording Completed");
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;
      }
    } catch (error) {
      // Microphone not available - will use simulated recording
      console.log('Microphone not available, will simulate recording');
      useRealMicrophone = false;
    }

    // If no microphone, set up simulated recording stop handler
    if (!useRealMicrophone) {
      const simulatedStop = () => {
        setIsRecording(false);
        const finalTime = recordingTimeRef.current || 10;
        const audioBlob = createSilentAudio(finalTime);
        setAudioChunks([audioBlob]);
        saveRecording(audioBlob, finalTime);
        handleAction("Voice Recording Completed");
      };
      
      // Store stop handler
      (mediaRecorderRef.current as any) = { 
        stop: simulatedStop,
        state: 'recording'
      };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAction = (action: string) => {
    toast({
      title: "Action Triggered",
      description: `${action} has been initiated.`,
    });
  };

  const model = data || {};
  const aiState = model.layout?.find((l: any) => l.type === "wellbeing_snapshot")?.items || [];
  const tone = aiState.find((i: any) => i.label === "Emotional Tone")?.value || "Normal";
  const trend = aiState.find((i: any) => i.label === "Trend")?.value || "Stable";
  const checks = model.layout?.find((l: any) => l.type === "voice_history")?.items || [];

  if (loading) return <div className="p-10 text-center text-purple-500">Loading AI Analysis...</div>;

  const handleNav = (item: string) => {
    toast({
      title: "Navigating",
      description: `Switching to ${item} view...`,
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-100/30 dark:from-purple-950/20 dark:via-background dark:to-background min-h-full border-2 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-[30px] overflow-hidden font-sans">

      {/* Mockup Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">+</span>
          </div>
          <span className="text-xl font-bold tracking-wide">NeoCare<sup className="text-xs align-top">®</sup></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-90">
          <div onClick={() => handleNav("Dashboard")} className="flex items-center gap-1 hover:text-cyan-300 cursor-pointer transition-colors"><span className="text-lg">⌂</span> Dashboard</div>
          <div onClick={() => handleNav("Clients")} className="flex items-center gap-1 hover:text-cyan-300 cursor-pointer transition-colors opacity-70">Clients</div>
          <div onClick={() => handleNav("Care Moments")} className="flex items-center gap-1 hover:text-cyan-300 cursor-pointer transition-colors border-b-2 border-white pb-1">Care Moments</div>
          <div onClick={() => handleNav("Medication")} className="flex items-center gap-1 hover:text-cyan-300 cursor-pointer transition-colors opacity-70">Medication</div>
          <div onClick={() => handleNav("NeoPay")} className="flex items-center gap-1 hover:text-cyan-300 cursor-pointer transition-colors opacity-70">NeoPay</div>
          <div onClick={() => handleNav("Reports")} className="flex items-center gap-1 hover:text-cyan-300 cursor-pointer transition-colors opacity-70">Reports</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" className="w-8 h-8 rounded-full border-2 border-white/50" alt="User" />
            <span className="text-sm">Lisa R.</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-700/50 flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-purple-900"></span>
          </div>
        </div>
      </div>

      {/* Header Content */}
      <div className="px-2"> {/* Added slight padding to match inner content spacing */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-100 tracking-tight mb-1">
              Client Voice & Wellbeing
            </h1>
            <p className="text-purple-800/60 dark:text-purple-300/60 text-lg">Listen + Collaborate for Wellbeing</p>
          </div>
          <ExportButton
            label="Export Wellbeing Report"
            options={[
              { label: "Export as PDF", format: "pdf" },
              { label: "Export as Word", format: "word" },
              { label: "Export as CSV", format: "csv" }
            ]}
            data={generateClientVoiceData()}
            pdfTitle="Client Voice & Wellbeing Report"
            filename="client-voice-wellbeing-report"
          />
        </div>

        {/* Top 3 Feature Cards with Neon Glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Client Surveys Card */}
          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-b from-white/60 to-purple-50/40 dark:from-purple-900/40 dark:to-purple-950/40 backdrop-blur-xl rounded-[24px]">
            <div className="h-44 relative overflow-hidden group transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: 'url(/images/survey.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent z-10 opacity-60"></div>
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md rounded-lg p-2 shadow-sm">
                {/* Mini Icon representation */}
                <div className="flex gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div><div className="w-4 h-1 bg-gray-300 rounded-full"></div></div>
                <div className="flex gap-1 mt-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div><div className="w-4 h-1 bg-gray-300 rounded-full"></div></div>
              </div>
            </div>
            <CardContent className="p-5 relative">
              <h3 className="text-xl font-bold text-white absolute -top-10 left-5 z-20 drop-shadow-md">Client Surveys</h3>
              <div className="flex items-center justify-between mt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full h-10 shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] text-md font-medium transition-all hover:scale-105">
                      Start Survey <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">{activeSurvey ? activeSurvey : "Client Surveys"}</DialogTitle>
                      <DialogDescription>{activeSurvey ? "Please answer the following questions." : "Select a survey to administer."}</DialogDescription>
                    </DialogHeader>

                    {!activeSurvey ? (
                      // List View
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-purple-900">Active / Due Now</h4>
                          {Object.keys(surveyQuestions).map(s => (
                            <div key={s} className="flex items-center justify-between p-3 rounded-lg border border-purple-200 bg-purple-50/50">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><CheckCircle className="w-4 h-4" /></div>
                                <div>
                                  <div className="font-semibold text-gray-800">{s}</div>
                                  <div className="text-xs text-gray-500">Due today • Est. 2 mins</div>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => { setActiveSurvey(s); setSurveyStep(0); }}>Start</Button>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Optional</h4>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 opacity-80">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><MessageSquare className="w-4 h-4" /></div>
                              <div>
                                <div className="font-semibold text-gray-700">Detailed Feedback</div>
                                <div className="text-xs text-gray-500">Anytime • Est. 5 mins</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleAction("Started detailed feedback")}>Start</Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Survey Taking View
                      <div className="py-6 space-y-6">
                        {activeSurvey && surveyQuestions[activeSurvey] && surveyQuestions[activeSurvey][surveyStep] ? (
                          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="text-lg font-medium">{surveyQuestions[activeSurvey][surveyStep].q}</div>

                            {surveyQuestions[activeSurvey][surveyStep].type === "scale" && (
                              <div className="space-y-4">
                                <div className="flex justify-between px-2">
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <Button key={n} variant="outline" className="h-10 w-8 p-0" onClick={() => {
                                      if (surveyStep < surveyQuestions[activeSurvey].length - 1) setSurveyStep(prev => prev + 1);
                                      else { setActiveSurvey(null); handleAction(`Completed Survey: ${activeSurvey}`); }
                                    }}>{n}</Button>
                                  ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 px-2"><span>Low</span><span>High</span></div>
                              </div>
                            )}

                            {surveyQuestions[activeSurvey][surveyStep].type === "yesno" && (
                              <div className="flex gap-4">
                                <Button className="flex-1" variant="outline" onClick={() => {
                                  if (surveyStep < surveyQuestions[activeSurvey].length - 1) setSurveyStep(prev => prev + 1);
                                  else { setActiveSurvey(null); handleAction(`Completed Survey: ${activeSurvey}`); }
                                }}>Yes</Button>
                                <Button className="flex-1" variant="outline" onClick={() => {
                                  if (surveyStep < surveyQuestions[activeSurvey].length - 1) setSurveyStep(prev => prev + 1);
                                  else { setActiveSurvey(null); handleAction(`Completed Survey: ${activeSurvey}`); }
                                }}>No</Button>
                              </div>
                            )}

                            {surveyQuestions[activeSurvey][surveyStep].type === "text" && (
                              <div className="space-y-2">
                                <Input placeholder="Type answer..." />
                                <Button className="w-full mt-2" onClick={() => {
                                  if (surveyStep < surveyQuestions[activeSurvey].length - 1) setSurveyStep(prev => prev + 1);
                                  else { setActiveSurvey(null); handleAction(`Completed Survey: ${activeSurvey}`); }
                                }}>Next</Button>
                              </div>
                            )}

                            {surveyQuestions[activeSurvey][surveyStep].type === "boolean" && (
                              <div className="flex gap-4">
                                <Button className="flex-1" variant="outline" onClick={() => {
                                  if (surveyStep < surveyQuestions[activeSurvey].length - 1) setSurveyStep(prev => prev + 1);
                                  else { setActiveSurvey(null); handleAction(`Completed Survey: ${activeSurvey}`); }
                                }}>Yes</Button>
                                <Button className="flex-1" variant="outline" onClick={() => {
                                  if (surveyStep < surveyQuestions[activeSurvey].length - 1) setSurveyStep(prev => prev + 1);
                                  else { setActiveSurvey(null); handleAction(`Completed Survey: ${activeSurvey}`); }
                                }}>No</Button>
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">Survey Complete!</h3>
                            <p className="text-gray-500">Thank you for your feedback.</p>
                            <Button className="mt-6" onClick={() => setActiveSurvey(null)}>Close</Button>
                          </div>
                        )}

                        {activeSurvey && surveyQuestions[activeSurvey] && surveyQuestions[activeSurvey][surveyStep] && (
                          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="text-xs text-gray-400">Question {surveyStep + 1} of {surveyQuestions[activeSurvey].length}</span>
                            <Button variant="ghost" size="sm" onClick={() => setActiveSurvey(null)}>Cancel</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <div className="ml-3 flex items-center gap-1 text-[10px] text-purple-800/50 dark:text-purple-300/50 border border-purple-200/50 rounded-md px-2 py-1 bg-white/50 backdrop-blur-sm">
                  <Lock className="w-3 h-3" /> 7D Proof
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Feedback Card */}
          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] transition-all bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[24px] relative">
            <div className="h-44 relative overflow-hidden group transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: 'url(/images/voice.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10 opacity-60"></div>
              <div className="absolute top-4 left-4 z-20 flex items-center gap-4">
                {/* Visual Waveform Mockup */}
                <div className="flex items-end gap-1 h-12">
                  {[20, 40, 30, 50, 30, 60, 40, 20].map((h, i) => (
                    <div key={i} className="w-1.5 bg-gradient-to-t from-green-400 to-yellow-300 rounded-full" style={{ height: `${h}%`, opacity: 0.8 }}></div>
                  ))}
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-purple-700 text-xl font-bold">🎤</span>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-12">
                  {[20, 40, 60, 40, 50, 30, 20].map((h, i) => (
                    <div key={i} className="w-1.5 bg-gradient-to-t from-pink-400 to-purple-300 rounded-full" style={{ height: `${h}%`, opacity: 0.8 }}></div>
                  ))}
                </div>
              </div>
            </div>
            <CardContent className="p-5 relative">
              <h3 className="text-xl font-bold text-white absolute -top-10 left-5 z-20 drop-shadow-md">Voice Feedback</h3>
              <div className="flex items-center justify-between">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    // Reset recording state when dialog closes
                    if (isRecording) {
                      stopRecording();
                    }
                    setRecordingTime(0);
                    setAudioChunks([]);
                    // Clean up any remaining stream
                    if (streamRef.current) {
                      streamRef.current.getTracks().forEach(track => track.stop());
                      streamRef.current = null;
                    }
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-white hover:bg-white/90 text-purple-700 rounded-full h-10 shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.7)] text-md font-bold transition-all hover:scale-105">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-2">✓</div> Record Feedback <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Client Voice</DialogTitle>
                      <DialogDescription>Capture 10s of audio for AI tone analysis.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        {isRecording && (
                          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                        )}
                        <Button
                          className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 shadow-xl transition-transform active:scale-95 ${
                            isRecording 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                          onClick={() => {
                            if (isRecording) {
                              stopRecording();
                            } else {
                              startRecording();
                            }
                          }}
                        >
                          <div className="flex flex-col items-center">
                            {isRecording ? (
                              <>
                                <div className="w-8 h-8 bg-white rounded-md mb-1"></div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Stop</span>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 bg-white rounded-full mb-1"></div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                  {recordingTime === 0 ? 'Start' : 'Record Again'}
                                </span>
                              </>
                            )}
                          </div>
                        </Button>
                      </div>

                      {/* Waveform */}
                      <div className="flex items-center gap-1 h-8">
                        {[1, 2, 3, 4, 5, 6, 3, 5, 2, 1].map((h, i) => (
                          <div 
                            key={i} 
                            className={`w-1 rounded-full ${
                              isRecording 
                                ? 'bg-red-500 animate-pulse' 
                                : 'bg-gray-300'
                            }`} 
                            style={{ 
                              height: `${h * 4 + 4}px`, 
                              animationDelay: `${i * 0.1}s`,
                              opacity: isRecording ? 1 : 0.5
                            }}
                          ></div>
                        ))}
                      </div>

                      <div className="text-2xl font-mono text-gray-700">
                        {formatTime(recordingTime)} / {formatTime(10)}
                      </div>
                      <p className="text-xs text-gray-400">
                        {isRecording 
                          ? 'Recording in progress...' 
                          : recordingTime === 10 
                            ? 'Recording complete! Click "Record Again" to record another 10 seconds.'
                            : 'Explicit consent required before recording. Click Start to begin.'}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="ml-4 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md">
                  <Lock className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wellbeing Check Card */}
          <Card className="overflow-hidden border border-purple-300/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all bg-gradient-to-b from-white/60 to-purple-50/40 dark:from-purple-900/40 dark:to-purple-950/40 backdrop-blur-xl rounded-[24px]">
            <div className="h-44 relative overflow-hidden group transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: 'url(/images/wellbeing.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent z-10 opacity-60"></div>
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md rounded-lg px-3 py-1 shadow-sm flex items-center gap-1">
                {/* Heart Icon Mockup */}
                <span className="text-purple-600 font-bold text-lg">♥</span>
              </div>
            </div>
            <CardContent className="p-5 relative">
              <h3 className="text-xl font-bold text-white absolute -top-10 left-5 z-20 drop-shadow-md">Wellbeing Check</h3>
              <div className="flex items-center justify-between mt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full h-10 shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] text-md font-medium transition-all hover:scale-105">
                      Update Wellbeing <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Update Wellbeing Status</DialogTitle>
                      <DialogDescription>Log the client's current mood and add notes.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                      <div className="space-y-3">
                        <Label>Current Mood</Label>
                        <div className="flex justify-between px-2 bg-gray-50 p-4 rounded-xl">
                          {["😢", "😐", "🙂", "😄", "🤩"].map(emoji => (
                            <button key={emoji} className="text-3xl hover:scale-125 transition-transform focus:outline-none focus:scale-125 focus:drop-shadow-md" onClick={() => handleAction(`Selected mood: ${emoji}`)}>{emoji}</button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="notes">Observation Notes</Label>
                        <Textarea id="notes" placeholder="e.g. Client seemed more energetic after lunch..." className="min-h-[100px]" />
                      </div>

                      <div className="space-y-3">
                        <Label>Physical Tags</Label>
                        <div className="flex flex-wrap gap-2">
                          {["Pain", "Nausea", "Fatigue", "Good Appetite", "Mobility"].map(tag => (
                            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-purple-100">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleAction("Saved Wellbeing Update")}>Save Update</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="ml-4 w-8 h-8 rounded-full border border-purple-200 flex items-center justify-center bg-white/40 backdrop-blur-sm shadow-sm">
                  <Lock className="w-4 h-4 text-purple-700/60" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sentiment & Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Client Sentiment Trends */}
          <Card className="border border-purple-200/50 shadow-[0_4px_20px_rgba(168,85,247,0.15)] bg-white/70 dark:bg-card/70 backdrop-blur-xl rounded-[24px] p-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Client Sentiment Trends</h3>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-0 text-xs font-normal">
                    🤖 AI Insight: {tone} & {trend}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Wellbeing Score Gauge - Enhanced Visual */}
                <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-full shadow-inner border border-white">
                  <div className="absolute w-full h-full rounded-full border-[12px] border-gray-200 border-t-purple-500 border-l-green-400 border-r-blue-400 rotate-45"></div> {/* Mockup multi-color border */}
                  <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-blue-600">8,6</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Wellbeing Score</span>
                  </div>
                </div>

                {/* Line Chart Area Mockup */}
                <div className="flex-1 h-32 relative">
                  {/* Simplified Chart Visual */}
                  <div className="absolute bottom-6 left-0 right-0 h-[100px] flex items-end justify-between px-2">
                    <div className="w-8 bg-purple-200/50 rounded-t-sm h-[40%]"></div>
                    <div className="w-8 bg-purple-300/50 rounded-t-sm h-[50%]"></div>
                    <div className="w-8 bg-purple-400/50 rounded-t-sm h-[65%]"></div>
                    <div className="w-8 bg-purple-500/50 rounded-t-sm h-[80%]"></div>
                  </div>
                  {/* Line Overlay */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                    <path d="M 20 80 Q 80 70 140 50 T 260 20" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="20" cy="80" r="4" fill="#4ade80" stroke="white" strokeWidth="2" />
                    <circle cx="80" cy="70" r="4" fill="#4ade80" stroke="white" strokeWidth="2" />
                    <circle cx="140" cy="50" r="4" fill="#4ade80" stroke="white" strokeWidth="2" />
                    <circle cx="200" cy="35" r="4" fill="#4ade80" stroke="white" strokeWidth="2" />
                    <circle cx="260" cy="20" r="4" fill="#4ade80" stroke="white" strokeWidth="2" />
                  </svg>
                  <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-gray-400 font-medium px-2">
                    <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6 border-t border-purple-100 pt-3">
                <p className="text-[10px] text-gray-400 flex items-center gap-1 border border-gray-200 rounded px-2 py-0.5">
                  <Lock className="w-2.5 h-2.5" /> Logged with 7D Proof
                </p>
                <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white">✓</div> Positive + 99%</span>
                  <span className="flex items-center gap-1 opacity-50"><div className="w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center text-[8px] text-white">✓</div> Neutral ~3%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Compassionate Items */}
          <Card className="border border-purple-200/50 shadow-[0_4px_20px_rgba(168,85,247,0.15)] bg-white/70 dark:bg-card/70 backdrop-blur-xl rounded-[24px] p-2">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg font-bold text-purple-900 dark:text-purple-100">Alerts & Compassionate Items</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-orange-400 hover:bg-orange-500 text-white rounded-full px-4 text-xs h-7 shadow-sm">
                      Schedule Care Moment <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-auto p-4">
                    <DialogHeader>
                      <DialogTitle>Schedule Care Moment</DialogTitle>
                      <DialogDescription>Select date and time for the visit.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 mt-2">
                      <Calendar mode="single" className="rounded-md border shadow" />
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">Morning</Button>
                        <Button variant="outline" size="sm">Afternoon</Button>
                      </div>
                      <Button onClick={() => handleAction("Scheduled")}>Confirm Schedule</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {/* AI Generated Alerts */}
                {model.layout?.find((l: any) => l.type === "thresholds")?.items.map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50 border border-purple-100/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-orange-500 fill-orange-500" />
                      <span className="text-sm font-semibold text-purple-900">{t.label}: {t.value}</span>
                    </div>
                    <Lock className="w-3 h-3 text-gray-300" />
                  </div>
                ))}

                {/* Voice Checks List */}
                {checks.slice(0, 2).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100 shadow-sm opacity-80">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Voice Check ({c.durationSec}s) - {c.toneLevel}</span>
                    </div>
                    <Lock className="w-3 h-3 text-gray-300" />
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                  <Lock className="w-2.5 h-2.5" /> Logged with 7D Proof
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="h-5 text-[10px] text-purple-700 hover:bg-purple-50 px-2 justify-end p-0">
                        <CalendarIcon className="w-3 h-3 mr-1" /> Schedule Care Moment <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto p-4">
                      <DialogHeader><DialogTitle>Schedule Moment</DialogTitle></DialogHeader>
                      <Calendar mode="single" className="rounded-md border shadow" />
                      <Button className="mt-4 w-full" onClick={() => handleAction("Scheduled")}>Confirm</Button>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="h-5 text-[10px] text-purple-700 hover:bg-purple-50 px-2 justify-end p-0">
                        <CalendarIcon className="w-3 h-3 mr-1" /> Escalate to Nurse <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Escalate Issue</DialogTitle>
                        <DialogDescription>Notify a senior nurse or specialist.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Nurse / Specialist</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mia">Nurse Mia (Primary)</SelectItem>
                              <SelectItem value="dr_smith">Dr. Smith</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Urgency</Label>
                          <RadioGroup defaultValue="medium" className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="low" id="r1" /><Label htmlFor="r1">Low</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="medium" id="r2" /><Label htmlFor="r2">Medium</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="high" id="r3" className="text-red-500" /><Label htmlFor="r3">High</Label></div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>Reason</Label>
                          <Input placeholder="Briefly describe the issue..." />
                        </div>
                      </div>
                      <DialogFooter><Button variant="destructive" onClick={() => handleAction("Escalation Sent")}>Escalate Now</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Quick Access Cards - Refined */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes & Reflections */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-purple-800 to-indigo-800 text-white rounded-[20px] relative group cursor-pointer hover:shadow-xl transition-all">
                {/* Abstract Bloom */}
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
                <CardContent className="p-4 pb-12 flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md transform -rotate-6 group-hover:rotate-0 transition-transform flex-shrink-0">
                    <span className="text-2xl">📣</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-tight mb-1">Notes & Reflections</h3>
                    <p className="text-xs text-purple-200 opacity-90">Log & score wellness insights!</p>
                  </div>
                </CardContent>
                <div className="absolute bottom-3 left-4 right-4 text-[9px] text-white/40 flex items-center gap-1 z-20">
                  <Lock className="w-2.5 h-2.5 flex-shrink-0" /> <span>Logged with 7D Proof</span>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Wellness Notes</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded">Note 1: Client feeling better today.</div>
                <div className="p-3 bg-muted rounded">Note 2: Enjoyed the morning walk.</div>
                <Button onClick={() => handleAction("Add Note")}>+ Add New Note</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Hybrid Meetings */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-indigo-800 to-blue-900 text-white rounded-[20px] relative group cursor-pointer hover:shadow-xl transition-all">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                <CardContent className="p-4 pb-12 flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md transform rotate-3 group-hover:rotate-0 transition-transform flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-tight mb-1">Hybrid Meetings</h3>
                    <p className="text-xs text-blue-200 opacity-90">Coordinate case discussions</p>
                  </div>
                </CardContent>
                <div className="absolute bottom-3 left-4 right-4 text-[9px] text-white/40 flex items-center gap-1 z-20">
                  <Lock className="w-2.5 h-2.5 flex-shrink-0" /> <span>Logged with 7D Proof</span>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upcoming Meetings</DialogTitle></DialogHeader>
              <div className="space-y-2">
                {upcomingMeetings.map(m => (
                  <div key={m.id} className="p-3 bg-muted rounded flex justify-between">
                    <div><div className="font-bold">{m.title}</div><div className="text-xs">{m.time}</div></div>
                    <Button size="sm" onClick={() => handleAction(`Joined ${m.title}`)}>Join</Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Activities & Leisure */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-purple-700 to-fuchsia-800 text-white rounded-[20px] relative group cursor-pointer hover:shadow-xl transition-all">
                <div className="absolute left-10 top-10 w-20 h-20 bg-pink-500 rounded-full blur-2xl opacity-30"></div>
                <CardContent className="p-4 pb-12 flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform flex-shrink-0">
                    <span className="text-2xl">🗓️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg leading-tight mb-1">Activities & Leisure</h3>
                    <p className="text-xs text-fuchsia-200 opacity-90">Plan events & social activities</p>
                  </div>
                </CardContent>
                <div className="absolute bottom-3 left-4 right-4 text-[9px] text-white/40 flex items-center gap-1 z-20">
                  <Lock className="w-2.5 h-2.5 flex-shrink-0" /> <span>Logged with 7D Proof</span>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Activities Calendar</DialogTitle></DialogHeader>
              <div className="space-y-2">
                {activityEvents.map(a => (
                  <div key={a.id} className="p-3 bg-muted rounded flex justify-between">
                    <div><div className="font-bold">{a.title}</div><div className="text-xs">{a.time}</div></div>
                    <Button size="sm" variant="outline" onClick={() => handleAction(`View details: ${a.title}`)}>Details</Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
