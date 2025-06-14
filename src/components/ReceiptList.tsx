import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Search, Edit, Eye, Filter } from "lucide-react";
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
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: receipts, isLoading: receiptsLoading } = useQuery({ queryKey: ['receipts'], queryFn: fetchReceipts});
  const { data: committees, isLoading: committeesLoading } = useQuery({ queryKey: ['committees'], queryFn: fetchCommittees });

  const committeeMap = useMemo(() => {
      if (!committees) return new Map();
      return new Map(committees.map(c => [c.id, c.name]));
  }, [committees]);

  // Filter committees based on user role
  const filteredCommittees = useMemo(() => {
    if (!committees) return [];
    
    // JD can see all committees
    if (user.role === 'JD') {
      return committees;
    }
    
    // Supervisor and DEO should only see their assigned committee
    if (user.role === 'Supervisor' || user.role === 'DEO') {
      const userCommittee = user.committee?.toLowerCase() || '';
      
      return committees.filter(committee => {
        const committeeName = committee.name.toLowerCase();
        
        // Try to match the user's committee with the database committee
        if (userCommittee === 'kakinada amc' && committeeName.includes('kakinada')) {
          return true;
        }
        if (userCommittee === 'tuni amc' && committeeName.includes('tuni')) {
          return true;
        }
        
        // Generic matching for other cases
        return committeeName.includes(userCommittee) || userCommittee.includes(committeeName);
      });
    }
    
    return [];
  }, [committees, user.role, user.committee]);
  
  const allReceipts = useMemo(() => {
      if (!receipts) return [];
      return receipts.map(r => ({
          ...r,
          committeeName: committeeMap.get(r.committee_id) || 'Loading...'
      }));
  }, [receipts, committeeMap]);

  // Filter receipts based on user role and committee access
  const userAccessibleReceipts = useMemo(() => {
    if (!allReceipts.length) return [];
    
    // JD can see all receipts
    if (user.role === 'JD') {
      return allReceipts;
    }
    
    // Supervisor and DEO should only see receipts from their committee
    if (user.role === 'Supervisor' || user.role === 'DEO') {
      const allowedCommitteeNames = filteredCommittees.map(c => c.name);
      return allReceipts.filter(receipt => 
        allowedCommitteeNames.includes(receipt.committeeName)
      );
    }
    
    return [];
  }, [allReceipts, user.role, filteredCommittees]);

  const commodities = useMemo(() => {
    if(!userAccessibleReceipts) return [];
    return [...new Set(userAccessibleReceipts.map(r => r.commodity))]
  }, [userAccessibleReceipts]);

  const filteredReceipts = userAccessibleReceipts.filter(receipt => {
    const r = receipt as any;
    const matchesSearch = searchTerm === '' || 
      (r.trader_name && r.trader_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.payee_name && r.payee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.receipt_number && r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.book_number && r.book_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCommittee = filterCommittee === 'all' || 
      r.committeeName === filterCommittee;
    
    const matchesCommodity = filterCommodity === 'all' || 
      r.commodity === filterCommodity;

    return matchesSearch && matchesCommittee && matchesCommodity;
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Book Number,Receipt Number,Trader Name,Payee Name,Committee,Commodity,Quantity,Unit,Value,Fees Paid\n"
      + filteredReceipts.map((receipt: any) => 
          `${receipt.date},${receipt.book_number},${receipt.receipt_number},${receipt.trader_name},${receipt.payee_name},${receipt.committeeName},${receipt.commodity},${receipt.quantity},${receipt.unit},${receipt.value},${receipt.fees_paid}`
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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="flex items-center">
              <FileText className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{getTitle()}</span>
            </span>
            {(user.role === 'Supervisor' || user.role === 'JD') && (
              <Button onClick={handleExport} variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-sm">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Desktop Filters or Mobile Expanded Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="w-full sm:w-48">
                  <Select value={filterCommittee} onValueChange={setFilterCommittee} disabled={committeesLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by committee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Committees</SelectItem>
                      {filteredCommittees?.map((committee) => (
                        <SelectItem key={committee.name} value={committee.name}>
                          {committee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-48">
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
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="block sm:hidden space-y-4">
            {receiptsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : filteredReceipts.length > 0 ? (
              filteredReceipts.map((receipt: any) => (
                <Card key={receipt.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{receipt.receipt_number}</p>
                        <p className="text-xs text-gray-500">{receipt.book_number}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 ml-2">
                        {receipt.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span>{new Date(receipt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trader:</span>
                        <span className="truncate ml-2">{receipt.trader_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payee:</span>
                        <span className="truncate ml-2">{receipt.payee_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Commodity:</span>
                        <span>{receipt.commodity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity:</span>
                        <span>{receipt.quantity} {receipt.unit}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-500">Value:</span>
                        <span>₹{Number(receipt.value).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {(user.role === 'DEO' && receipt.created_by === user.id) && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-gray-500">No receipts found</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[120px]">Book/Receipt</TableHead>
                  <TableHead className="min-w-[150px]">Trader</TableHead>
                  <TableHead className="min-w-[150px]">Payee</TableHead>
                  <TableHead className="min-w-[120px]">Committee</TableHead>
                  <TableHead className="min-w-[100px]">Commodity</TableHead>
                  <TableHead className="min-w-[80px]">Quantity</TableHead>
                  <TableHead className="min-w-[100px]">Value</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receiptsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={10}><Skeleton className="h-8 w-full" /></TableCell>
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
                          <div className="font-medium truncate max-w-[120px]">{receipt.trader_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium truncate max-w-[120px]">{receipt.payee_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium truncate max-w-[120px]">{receipt.committeeName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{receipt.commodity}</TableCell>
                      <TableCell>{receipt.quantity} {receipt.unit}</TableCell>
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
                    <TableCell colSpan={10} className="text-center py-8">
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

          {/* Summary Footer */}
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600">
            <span>
              Showing {filteredReceipts.length} of {userAccessibleReceipts.length} receipts
            </span>
            <span className="font-medium">
              Total Value: ₹{filteredReceipts.reduce((sum, receipt: any) => sum + Number(receipt.value), 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptList;
