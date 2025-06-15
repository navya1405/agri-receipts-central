
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useReceiptData } from '@/hooks/useReceiptData';

const Analytics = ({ user }: { user: any }) => {
  const { userAccessibleReceipts, receiptsLoading, userCommitteeId } = useReceiptData(user);
  const { toast } = useToast();

  console.log(`Analytics - User: ${user.username}, Role: ${user.role}, Committee: ${user.committee}`);
  console.log(`Analytics - User Committee ID: ${userCommitteeId}`);
  console.log(`Analytics - Accessible receipts count: ${userAccessibleReceipts.length}`);

  if (receiptsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading analytics data...</div>
      </div>
    );
  }

  // Use userAccessibleReceipts which is already filtered by user's committee access
  const receiptsData = userAccessibleReceipts;

  console.log(`Analytics - Processing ${receiptsData.length} receipts for analysis`);

  // Process data for charts using the filtered receipts
  const districtData = receiptsData.reduce((acc: any, receipt) => {
    const district = receipt.committeeName || 'Unknown';
    if (!acc[district]) {
      acc[district] = { district, count: 0, value: 0 };
    }
    acc[district].count += 1;
    acc[district].value += Number(receipt.value) || 0;
    return acc;
  }, {});

  const districtChartData = Object.values(districtData);

  const commodityData = receiptsData.reduce((acc: any, receipt) => {
    const commodity = receipt.commodity || 'Unknown';
    if (!acc[commodity]) {
      acc[commodity] = { commodity, count: 0, value: 0 };
    }
    acc[commodity].count += 1;
    acc[commodity].value += Number(receipt.value) || 0;
    return acc;
  }, {});

  const commodityChartData = Object.values(commodityData).slice(0, 10); // Top 10 commodities

  // Monthly trend data
  const monthlyData = receiptsData.reduce((acc: any, receipt) => {
    const month = new Date(receipt.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { month, count: 0, value: 0 };
    }
    acc[month].count += 1;
    acc[month].value += Number(receipt.value) || 0;
    return acc;
  }, {});

  const monthlyChartData = Object.values(monthlyData);

  const totalReceipts = receiptsData.length;
  const totalValue = receiptsData.reduce((sum, receipt) => sum + (Number(receipt.value) || 0), 0);
  const totalQuantity = receiptsData.reduce((sum, receipt) => sum + (Number(receipt.quantity) || 0), 0);
  const avgValue = totalReceipts > 0 ? totalValue / totalReceipts : 0;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

  // Determine analytics scope based on user role
  const getAnalyticsTitle = () => {
    switch (user.role) {
      case 'JD':
        return 'District Analytics Dashboard';
      case 'Supervisor':
        return `${user.committee} Analytics Dashboard`;
      default:
        return 'Analytics Dashboard';
    }
  };

  const getAnalyticsDescription = () => {
    switch (user.role) {
      case 'JD':
        return 'Comprehensive overview of AMC receipts across East Godavari District';
      case 'Supervisor':
        return `Committee-level analysis of receipts and trading activity for ${user.committee}`;
      default:
        return 'Analysis of receipts and trading activity';
    }
  };

  // Show a message if no data is available
  if (totalReceipts === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getAnalyticsTitle()}</h2>
          <p className="text-gray-600">{getAnalyticsDescription()}</p>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">No Data Available</h3>
              <p>No receipts found for {user.role === 'JD' ? 'the district' : 'your committee'}. Once receipts are added, analytics will be displayed here.</p>
              {user.role === 'Supervisor' && (
                <p className="mt-2 text-sm">Committee: {user.committee}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getAnalyticsTitle()}</h2>
        <p className="text-gray-600">{getAnalyticsDescription()}</p>
      </div>

      {/* Debug Info for Supervisor */}
      {user.role === 'Supervisor' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800">
              <p><strong>Committee:</strong> {user.committee}</p>
              <p><strong>Committee ID:</strong> {userCommitteeId ? userCommitteeId.slice(0, 8) + '...' : 'Not Found'}</p>
              <p><strong>Receipts Found:</strong> {totalReceipts}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReceipts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {user.role === 'JD' ? 'District total' : user.role === 'Supervisor' ? 'Committee total' : 'All time count'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalValue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Cumulative trade value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalQuantity / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Metric tons traded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Receipt Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Committee/District-wise Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>
              {user.role === 'JD' ? 'Committee-wise Receipt Distribution' : 'Committee Receipt Distribution'}
            </CardTitle>
            <CardDescription>
              {user.role === 'JD' ? 'Number of receipts by committee' : `Receipt distribution for ${user.committee}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Commodities */}
        <Card>
          <CardHeader>
            <CardTitle>Top Commodities</CardTitle>
            <CardDescription>Most traded commodities by volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={commodityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ commodity, percent }) => `${commodity} ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {commodityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trading Trend</CardTitle>
            <CardDescription>Receipt count and value trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Receipt Count" />
                <Line yAxisId="right" type="monotone" dataKey="value" stroke="#82ca9d" name="Total Value" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {user.role === 'JD' ? 'Committee Performance' : 'Committee Performance'}
            </CardTitle>
            <CardDescription>
              {user.role === 'JD' ? 'Detailed committee-wise breakdown' : `Performance summary for ${user.committee}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {districtChartData.map((district: any, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{district.district}</span>
                  <div className="text-right">
                    <div className="font-bold">{district.count} receipts</div>
                    <div className="text-sm text-gray-600">₹{(Number(district.value) / 100000).toFixed(1)}L</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commodity Analysis</CardTitle>
            <CardDescription>Top commodities by trade value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commodityChartData.slice(0, 8).map((commodity: any, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{commodity.commodity}</span>
                  <div className="text-right">
                    <div className="font-bold">{commodity.count} receipts</div>
                    <div className="text-sm text-gray-600">₹{(Number(commodity.value) / 100000).toFixed(1)}L</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
