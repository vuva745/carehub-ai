import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HouseholdHelp = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Household Help</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Household assistance and support services</p>
        </CardContent>
      </Card>
    </div>
  );
};
