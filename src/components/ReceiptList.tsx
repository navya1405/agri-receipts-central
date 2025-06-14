
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Search, Edit, Eye } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const fetchReceipts = async () => {
  const { data: rawReceipts, error: rawError } = await supabase.from('receipts').select('*').order('created_at', {ascending: false});
  if(rawError) throw new Error(rawError.message);
  return rawReceipts;
};

const fetchCommittees = async () => {
    const { data, error } = await supabase.from('committees').select('id, name');
    if (error) throw new Error(error.message);
    return data;
}

const ReceiptList = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommittee, setFilterCommittee] = useState('all');
  const [filterCommodity, setFilterCommodity] = useState('all');
  
  const { data: receipts, isLoading: receiptsLoading } = useQuery({ queryKey: ['receipts'], queryFn: fetchReceipts});
  const { data: committees, isLoading: committeesLoading } = useQuery({ queryKey: ['committees'], queryFn: fetchCommittees });

  const committeeMap = useMemo(() => {
      if (!committees) return new Map();
      return new Map(committees.map(c => [c.id, c.name]));
  }, [committees]);
  
  const allReceipts = useMemo(() => {
      if (!receipts) return [];
      return receipts.map(r => ({
          ...r,
          sellerCommittee: committeeMap.get(r.seller_committee_id) || 'Loading...',
          buyerCommittee: committeeMap.get(r.buyer_committee_id) || 'Loading...'
      }));
  }, [receipts, committeeMap]);

  const commodities = useMemo(() => {
    if(!receipts) return [];
    return [...new Set(receipts.map(r => r.commodity))]
  }, [receipts]);

  const filteredReceipts = allReceipts.filter(receipt => {
    const r = receipt as any;
    const matchesSearch = searchTerm === '' || 
      (r.seller_name && r.seller_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.buyer_name && r.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.receipt_number && r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.book_number && r.book_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCommittee = filterCommittee === 'all' || 
      r.sellerCommittee === filterCommittee || 
      r.buyerCommittee === filterCommittee;
    
    const matchesCommodity = filterCommodity === 'all' || 
      r.commodity === filterCommodity;

    return matchesSearch && matchesCommittee && matchesCommodity;
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Book Number,Receipt Number,Seller Name,Buyer Name,Seller Committee,Buyer Committee,Commodity,Quantity,Value,Fees Paid\n"
      + filteredReceipts.map((receipt: any) => 
          `${receipt.date},${receipt.book_number},${receipt.receipt_number},${receipt.seller_name},${receipt.buyer_name},${receipt.sellerCommittee},${receipt.buyerCommittee},${receipt.commodity},${receipt.quantity},${receipt.value},${receipt.fees_paid}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "amc_receipts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTitle = () => {
    switch (user.role) {
      case 'DEO': return 'My Receipts';
      case 'Supervisor': return 'Committee Receipts';
      case 'JD': return 'All Receipts';
      default: return 'Receipts';
    }
  };

  const getDescription = () => {
    switch (user.role) {
      case 'DEO': return 'View and manage receipts you have created';
      case 'Supervisor': return 'View receipts for your assigned committee';
      case 'JD': return 'Complete overview of all receipts in the system';
      default: return 'View receipt records';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {getTitle()}
            </span>
            {(user.role === 'Supervisor' || user.role === 'JD') && (
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by seller, buyer, receipt number, or book number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={filterCommittee} onValueChange={setFilterCommittee} disabled={committeesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by committee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Committees</SelectItem>
                  {committees?.map((committee) => (
                    <SelectItem key={committee.name} value={committee.name}>
                      {committee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Select value={filterCommodity} onValueChange={setFilterCommodity} disabled={receiptsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by commodity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Commodities</SelectItem>
                  {commodities.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Book/Receipt</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receiptsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={9}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                    ))
                ) : filteredReceipts.length > 0 ? (
                  filteredReceipts.map((receipt: any) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">
                        {new Date(receipt.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{receipt.book_number}</div>
                          <div className="text-gray-500">{receipt.receipt_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{receipt.seller_name}</div>
                          <div className="text-gray-500">{receipt.sellerCommittee}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{receipt.buyer_name}</div>
                          <div className="text-gray-500">{receipt.buyerCommittee}</div>
                        </div>
                      </TableCell>
                      <TableCell>{receipt.commodity}</TableCell>
                      <TableCell>{receipt.quantity} Q</TableCell>
                      <TableCell>₹{Number(receipt.value).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {receipt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          {(user.role === 'DEO' && receipt.created_by === user.id) && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No receipts found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredReceipts.length} of {allReceipts.length} receipts
            </span>
            <span>
              Total Value: ₹{filteredReceipts.reduce((sum, receipt: any) => sum + Number(receipt.value), 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptList;
