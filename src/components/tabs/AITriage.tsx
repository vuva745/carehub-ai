import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AITriage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Triage (Phone Support)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">AI-powered phone support and triage system</p>
        </CardContent>
      </Card>
    </div>
  );
};
