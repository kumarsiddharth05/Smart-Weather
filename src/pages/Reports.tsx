import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Reports</h1>
        <p className="text-muted-foreground mt-1">Analytics and performance reports</p>
      </div>
      <Card className="shadow-card">
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">Reports module - View attendance and marks analytics from the dashboard</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
