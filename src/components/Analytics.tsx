
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, FileText, Building2, Users, IndianRupee } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const fetchAnalyticsData = async () => {
  const { data: receipts, error: receiptsError } = await supabase.from('receipts').select('*');
  const { data: committees, error: committeesError } = await supabase.from('committees').select('*');
  
  if (receiptsError) throw new Error(receiptsError.message);
  if (committeesError) throw new Error(committeesError.message);
  
  return { receipts, committees };
};

const Analytics = ({ user }) => {
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['analytics'], 
    queryFn: fetchAnalyticsData,
    enabled: user.role === 'JD'
  });

  const districts = useMemo(() => {
    if (!data?.committees) return [];
    return [...new Set(data.committees.map(c => c.district))].filter(Boolean);
  }, [data?.committees]);

  const filteredData = useMemo(() => {
    if (!data?.receipts || !data?.committees) return { receipts: [], committees: [] };
    
    let filteredReceipts = data.receipts;
    let filteredCommittees = data.committees;

    if (selectedDistrict !== 'all') {
      const districtCommitteeIds = data.committees
        .filter(c => c.district === selectedDistrict)
        .map(c => c.id);
      
      filteredReceipts = data.receipts.filter(r => 
        districtCommitteeIds.includes(r.seller_committee_id) || 
        districtCommitteeIds.includes(r.buyer_committee_id)
      );
      
      filteredCommittees = data.committees.filter(c => c.district === selectedDistrict);
    }

    if (selectedPeriod !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredReceipts = filteredReceipts.filter(r => 
        new Date(r.created_at) >= cutoffDate
      );
    }

    return { receipts: filteredReceipts, committees: filteredCommittees };
  }, [data, selectedDistrict, selectedPeriod]);

  const analytics = useMemo(() => {
    if (!filteredData.receipts.length) {
      return {
        totalReceipts: 0,
        totalValue: 0,
        totalFees: 0,
        avgValue: 0,
        topCommodities: [],
        committeeStats: [],
        districtStats: []
      };
    }

    const receipts = filteredData.receipts;
    const committees = filteredData.committees;
    
    const totalReceipts = receipts.length;
    const totalValue = receipts.reduce((sum, r) => sum + Number(r.value), 0);
    const totalFees = receipts.reduce((sum, r) => sum + Number(r.fees_paid), 0);
    const avgValue = totalValue / totalReceipts;

    // Top commodities
    const commodityStats = receipts.reduce((acc, r) => {
      acc[r.commodity] = (acc[r.commodity] || 0) + Number(r.value);
      return acc;
    }, {});
    
    const topCommodities = Object.entries(commodityStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([commodity, value]) => ({ commodity, value }));

    // Committee stats
    const committeeMap = new Map(committees.map(c => [c.id, c]));
    const committeeStats = receipts.reduce((acc, r) => {
      const sellerCommittee = committeeMap.get(r.seller_committee_id);
      const buyerCommittee = committeeMap.get(r.buyer_committee_id);
      
      if (sellerCommittee) {
        const key = sellerCommittee.name;
        acc[key] = (acc[key] || 0) + 1;
      }
      if (buyerCommittee && buyerCommittee.id !== r.seller_committee_id) {
        const key = buyerCommittee.name;
        acc[key] = (acc[key] || 0) + 1;
      }
      
      return acc;
    }, {});

    const topCommittees = Object.entries(committeeStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([committee, count]) => ({ committee, count }));

    // District stats
    const districtStats = receipts.reduce((acc, r) => {
      const sellerCommittee = committeeMap.get(r.seller_committee_id);
      const buyerCommittee = committeeMap.get(r.buyer_committee_id);
      
      if (sellerCommittee?.district) {
        acc[sellerCommittee.district] = (acc[sellerCommittee.district] || 0) + Number(r.value);
      }
      if (buyerCommittee?.district && buyerCommittee.district !== sellerCommittee?.district) {
        acc[buyerCommittee.district] = (acc[buyerCommittee.district] || 0) + Number(r.value);
      }
      
      return acc;
    }, {});

    const topDistricts = Object.entries(districtStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([district, value]) => ({ district, value }));

    return {
      totalReceipts,
      totalValue,
      totalFees,
      avgValue,
      topCommodities,
      committeeStats: topCommittees,
      districtStats: topDistricts
    };
  }, [filteredData]);

  if (user.role !== 'JD') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Analytics access is restricted to JD users only.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Andhra Pradesh AMC Analytics
          </CardTitle>
          <CardDescription>
            Complete state-wide analytics and insights for agricultural market committee activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-48">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{analytics.totalReceipts.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trade Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">₹{(analytics.totalValue / 10000000).toFixed(1)}Cr</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">₹{(analytics.totalFees / 100000).toFixed(1)}L</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trade Value</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">₹{(analytics.avgValue / 1000).toFixed(0)}K</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Commodities by Value</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.topCommodities.map((item, index) => (
                  <div key={item.commodity} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{index + 1}. {item.commodity}</span>
                    <span className="text-sm text-gray-600">₹{(item.value / 100000).toFixed(1)}L</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Active Committees</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.committeeStats.map((item, index) => (
                  <div key={item.committee} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{index + 1}. {item.committee.split(' AMC')[0]}</span>
                    <span className="text-sm text-gray-600">{item.count} transactions</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>District-wise Trade Value</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.districtStats.map((item) => (
                  <div key={item.district} className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-gray-900">{item.district}</div>
                    <div className="text-lg font-bold text-blue-600">₹{(item.value / 100000).toFixed(1)}L</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
