import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { BarChart3 } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>
              This page will contain detailed analytics, charts, and performance metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Coming soon: Reader engagement metrics, page turn analytics, ad performance, and detailed reporting.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
