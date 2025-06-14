
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const ReceiptSearch = ({ user }) => {
  const [searchData, setSearchData] = useState({
    book_number: '',
    receipt_number: ''
  });
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchResult(null);

    // First get the receipt
    const { data: receipt, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('book_number', searchData.book_number)
        .eq('receipt_number', searchData.receipt_number)
        .maybeSingle();

    if (error) {
        toast({ title: "Search Error", description: error.message, variant: "destructive" });
        setIsSearching(false);
        return;
    }

    if (receipt) {
        // Get committee names separately
        const { data: sourceCommittee } = await supabase
            .from('committees')
            .select('name')
            .eq('id', receipt.source_committee_id)
            .single();

        const { data: destCommittee } = await supabase
            .from('committees')
            .select('name')
            .eq('id', receipt.dest_committee_id)
            .single();

        const result = {
            ...receipt,
            sourceCommittee: sourceCommittee?.name || 'Unknown',
            destCommittee: destCommittee?.name || 'Unknown',
            status: 'Genuine'
        };
        setSearchResult(result);
        toast({ title: "Receipt Found", description: "Receipt verification successful." });
    } else {
        setSearchResult({ status: 'Not Found' });
        toast({ title: "Receipt Not Found", description: "No matching receipt found.", variant: "destructive" });
    }

    setIsSearching(false);
  };

  const handleReset = () => {
    setSearchData({ book_number: '', receipt_number: '' });
    setSearchResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Receipt Verification
          </CardTitle>
          <CardDescription>
            Search and verify AMC trade receipts by book and receipt number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookNumber">Book Number</Label>
                <Input id="bookNumber" placeholder="Enter book number" value={searchData.book_number} onChange={(e) => handleInputChange('book_number', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input id="receiptNumber" placeholder="Enter receipt number" value={searchData.receipt_number} onChange={(e) => handleInputChange('receipt_number', e.target.value)} required />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSearching} className="bg-green-600 hover:bg-green-700">
                {isSearching ? 'Searching...' : 'Verify Receipt'}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>Reset Search</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center"><FileText className="mr-2 h-5 w-5" />Verification Result</span>
              {searchResult.status === 'Genuine' ? (
                <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Genuine</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" />Not Found</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResult.status === 'Genuine' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><Label className="text-sm font-medium text-gray-500">Receipt Date</Label><p className="text-sm font-semibold">{new Date(searchResult.date).toLocaleDateString()}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Trader Name</Label><p className="text-sm font-semibold">{searchResult.trader_name}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Commodity</Label><p className="text-sm font-semibold">{searchResult.commodity}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Source Committee</Label><p className="text-sm font-semibold">{searchResult.sourceCommittee}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Destination Committee</Label><p className="text-sm font-semibold">{searchResult.destCommittee}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Quantity</Label><p className="text-sm font-semibold">{searchResult.quantity} Quintals</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Value</Label><p className="text-sm font-semibold">₹{Number(searchResult.value).toLocaleString()}</p></div>
                  <div><Label className="text-sm font-medium text-gray-500">Fees Paid</Label><p className="text-sm font-semibold">₹{Number(searchResult.fees_paid).toLocaleString()}</p></div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">Invalid or Not Found</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  No matching receipt found. Please verify the information and try again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReceiptSearch;
