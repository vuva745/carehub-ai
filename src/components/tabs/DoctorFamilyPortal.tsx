import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DoctorFamilyPortal = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Doctor & Family Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Communication portal for doctors and family members</p>
        </CardContent>
      </Card>
    </div>
  );
};
