import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DevicesHardware = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Devices & SmartCare Hardware</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connected devices and hardware management</p>
        </CardContent>
      </Card>
    </div>
  );
};
