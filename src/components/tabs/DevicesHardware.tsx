import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Scan, Activity, Pill, Radio, Wifi, Lock, Database, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const DevicesHardware = () => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const images = [
    "/images/17.jpeg",
    "/images/16.jpeg",
    "/images/15.jpeg",
    "/images/14.jpeg",
    "/images/13.jpeg",
    "/images/12.jpeg",
    "/images/11.jpeg",
    "/images/10.jpeg",
    "/images/9.jpeg",
    "/images/8.jpeg",
    "/images/7.jpeg",
    "/images/6.jpeg",
    "/images/5.jpeg",
    "/images/4.jpeg",
    "/images/3.jpeg",
    "/images/2.jpeg",
  ];

  return (
    <div className="px-8 pb-8 pt-0 space-y-6 bg-black border-2 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] shadow-cyan-400/50 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Devices & SmartCare Hardware</h2>
          <p className="text-sm text-white mt-1">Manage and monitor all NeoCare medical devices</p>
        </div>
      </div>

      {/* Device Grid - Images Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        {images.map((image, index) => (
          <div key={index} className="w-full h-[300px] overflow-hidden bg-black flex items-center justify-center">
            <img
              src={image}
              alt={`Device ${17 - index}`}
              className="w-full h-full object-contain object-top"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevicesHardware;
