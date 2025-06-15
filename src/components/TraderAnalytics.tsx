
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, User, DollarSign, Package, Calendar } from 'lucide-react';
import { useReceiptData } from '@/hooks/useReceiptData';

// Define types for trader data
interface Receipt {
  id: string;
  date: string;
  seller_name: string;
  commodity: string;
  quantity: number;
  value: number;
  seller_committee?: {
    name: string;
    district: string;
  };
  buyer_committee?: {
    name: string;
    district: string;
  };
}

interface TraderData {
  name: string;
  receipts: Receipt[];
  totalValue: number;
  totalQuantity: number;
  commodities: string[];
  avgValue: number;
  lastTransaction: string | null;
}

const TraderAnalytics = ({ user }: { user: any }) => {
  const { userAccessibleReceipts, receiptsLoading } = useReceiptData(user);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const { toast } = useToast();

  console.log(`TraderAnalytics - User: ${user.username}, Role: ${user.role}, Committee: ${user.committee}`);
  console.log(`TraderAnalytics - Accessible receipts count: ${userAccessibleReceipts.length}`);

  if (receiptsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading trader analytics...</div>
      </div>
    );
  }

  // Use real receipts data instead of demo data
  const receiptsData = userAccessibleReceipts;

  // Process trader data with proper typing
  const traderData: Record<string, TraderData> = receiptsData.reduce((acc, receipt) => {
    const traderName = receipt.trader_name || 'Unknown Trader';
    if (!acc[traderName]) {
      acc[traderName] = {
        name: traderName,
        receipts: [],
        totalValue: 0,
        totalQuantity: 0,
        commodities: [],
        avgValue: 0,
        lastTransaction: null
      };
    }
    
    acc[traderName].receipts.push(receipt);
    acc[traderName].totalValue += Number(receipt.value) || 0;
    acc[traderName].totalQuantity += Number(receipt.quantity) || 0;
    
    // Handle commodities as a Set temporarily, then convert to array
    const commoditiesSet = new Set(acc[traderName].commodities);
    commoditiesSet.add(receipt.commodity);
    acc[traderName].commodities = Array.from(commoditiesSet);
    
    if (!acc[traderName].lastTransaction || new Date(receipt.date) > new Date(acc[traderName].lastTransaction)) {
      acc[traderName].lastTransaction = receipt.date;
    }
    
    return acc;
  }, {} as Record<string, TraderData>);

  // Calculate averages
  Object.keys(traderData).forEach(traderName => {
    const trader = traderData[traderName];
    trader.avgValue = trader.receipts.length > 0 ? trader.totalValue / trader.receipts.length : 0;
  });

  const filteredTraders = Object.values(traderData).filter((trader: TraderData) =>
    trader.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topTraders = Object.values(traderData)
    .sort((a: TraderData, b: TraderData) => b.totalValue - a.totalValue)
    .slice(0, 10);

  const selectedTraderData = selectedTrader ? traderData[selectedTrader] : null;

  // Monthly data for selected trader
  const getTraderMonthlyData = (trader: TraderData) => {
    if (!trader) return [];
    
    const monthlyData = trader.receipts.reduce((acc: any, receipt: Receipt) => {
      const month = new Date(receipt.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, count: 0, value: 0 };
      }
      acc[month].count += 1;
      acc[month].value += Number(receipt.value) || 0;
      return acc;
    }, {});
    
    return Object.values(monthlyData);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

  // Show empty state if no traders found
  if (Object.keys(traderData).length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trader Performance Analytics</h2>
          <p className="text-gray-600">Comprehensive analysis of trader performance and trading patterns</p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">No Trader Data Available</h3>
              <p>No receipts with trader information found for {user.role === 'JD' ? 'the district' : 'your committee'}. Once receipts with trader data are added, analytics will be displayed here.</p>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trader Performance Analytics</h2>
        <p className="text-gray-600">Comprehensive analysis of trader performance and trading patterns</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Traders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search by trader name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setSelectedTrader(null)}>
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Traders Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Traders</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(traderData).length}</div>
            <p className="text-xs text-muted-foreground">Active traders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Trader Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(topTraders[0]?.totalValue / 100000 || 0).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">{topTraders[0]?.name || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Receipts/Trader</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(traderData).length > 0 
                ? Math.round(receiptsData.length / Object.keys(traderData).length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Per trader</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(traderData).filter((trader: TraderData) => {
                if (!trader.lastTransaction) return false;
                const lastTransaction = new Date(trader.lastTransaction);
                const currentMonth = new Date();
                return lastTransaction.getMonth() === currentMonth.getMonth() && 
                       lastTransaction.getFullYear() === currentMonth.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Traders by Value */}
        <Card>
          <CardHeader>
            <CardTitle>Top Traders by Value</CardTitle>
            <CardDescription>Highest trading volume by value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTraders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total Value']} />
                <Bar dataKey="totalValue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trader List */}
        <Card>
          <CardHeader>
            <CardTitle>Trader Directory</CardTitle>
            <CardDescription>Click on a trader to view detailed analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredTraders.map((trader: TraderData, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTrader === trader.name 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTrader(trader.name)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{trader.name}</h4>
                      <p className="text-sm text-gray-600">
                        {trader.receipts.length} receipts • {trader.commodities.length} commodities
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{(trader.totalValue / 100000).toFixed(1)}L</div>
                      <div className="text-sm text-gray-600">Total Value</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Trader Details */}
      {selectedTraderData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {selectedTraderData.name} - Detailed Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive performance analysis for the selected trader
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedTraderData.receipts.length}</div>
                  <div className="text-sm text-blue-600">Total Receipts</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{(selectedTraderData.totalValue / 100000).toFixed(1)}L</div>
                  <div className="text-sm text-green-600">Total Value</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">₹{selectedTraderData.avgValue.toFixed(0)}</div>
                  <div className="text-sm text-yellow-600">Avg per Receipt</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedTraderData.commodities.length}</div>
                  <div className="text-sm text-purple-600">Commodities</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <div>
                  <h4 className="font-medium mb-4">Monthly Trading Pattern</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={getTraderMonthlyData(selectedTraderData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" name="Value" />
                      <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Count" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Commodities */}
                <div>
                  <h4 className="font-medium mb-4">Commodities Traded</h4>
                  <div className="space-y-2">
                    {selectedTraderData.commodities.map((commodity: string, index: number) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {commodity}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p><strong>Last Transaction:</strong> {selectedTraderData.lastTransaction ? new Date(selectedTraderData.lastTransaction).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Total Quantity:</strong> {selectedTraderData.totalQuantity.toLocaleString()} units</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TraderAnalytics;
