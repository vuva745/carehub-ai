import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FinanceBilling = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Finance & Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Financial management and billing system</p>
        </CardContent>
      </Card>
    </div>
  );
};
