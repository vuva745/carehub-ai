import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PlanningRoutes = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Planning & Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Route planning and schedule optimization</p>
        </CardContent>
      </Card>
    </div>
  );
};
