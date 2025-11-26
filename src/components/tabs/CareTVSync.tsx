import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CareTVSync = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CareTV Sync (Video Uploads)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Video upload and synchronization system</p>
        </CardContent>
      </Card>
    </div>
  );
};
