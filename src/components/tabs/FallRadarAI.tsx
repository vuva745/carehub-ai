import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FallRadarAI = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>FallRadar AI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Fall detection and prevention monitoring system</p>
        </CardContent>
      </Card>
    </div>
  );
};
