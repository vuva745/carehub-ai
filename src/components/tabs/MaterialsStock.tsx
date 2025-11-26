import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const MaterialsStock = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Materials & Stock Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Inventory and materials management system</p>
        </CardContent>
      </Card>
    </div>
  );
};
