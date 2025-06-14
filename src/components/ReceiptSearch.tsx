
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReceiptSearch = ({ user }) => {
  const [searchData, setSearchData] = useState({
    committee: '',
    bookNumber: '',
    receiptNumber: ''
  });
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const committees = [
    'Mumbai AMC', 'Pune AMC', 'Nashik AMC', 'Nagpur AMC', 'Aurangabad AMC',
    'Kolhapur AMC', 'Sangli AMC', 'Solapur AMC', 'Ahmednagar AMC', 'Satara AMC'
  ];

  // Mock receipt data for demo
  const mockReceipts = [
    {
      id: '1',
      committee: 'Mumbai AMC',
      bookNumber: 'BK001',
      receiptNumber: 'R001',
      date: '2024-06-12',
      traderName: 'Rajesh Traders',
      sourceCommittee: 'Mumbai AMC',
      destCommittee: 'Pune AMC',
      commodity: 'Rice',
      quantity: 50,
      value: 125000,
      feesPaid: 2500,
      status: 'Genuine'
    },
    {
      id: '2',
      committee: 'Pune AMC',
      bookNumber: 'BK002',
      receiptNumber: 'R002',
      date: '2024-06-13',
      traderName: 'Shankar Agro',
      sourceCommittee: 'Pune AMC',
      destCommittee: 'Nashik AMC',
      commodity: 'Wheat',
      quantity: 75,
      value: 187500,
      feesPaid: 3750,
      status: 'Genuine'
    }
  ];

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);

    // Simulate API call
    setTimeout(() => {
      const found = mockReceipts.find(receipt => 
        receipt.committee === searchData.committee &&
        receipt.bookNumber === searchData.bookNumber &&
        receipt.receiptNumber === searchData.receiptNumber
      );

      if (found) {
        setSearchResult(found);
        toast({
          title: "Receipt Found",
          description: "Receipt verification successful - Status: Genuine",
        });
      } else {
        setSearchResult({ status: 'Not Found' });
        toast({
          title: "Receipt Not Found",
          description: "No matching receipt found in the system",
          variant: "destructive",
        });
      }
      setIsSearching(false);
    }, 1000);
  };

  const handleReset = () => {
    setSearchData({
      committee: '',
      bookNumber: '',
      receiptNumber: ''
    });
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
            Search and verify AMC trade receipts by committee, book number, and receipt number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="committee">Committee</Label>
                <Select value={searchData.committee} onValueChange={(value) => handleInputChange('committee', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select committee" />
                  </SelectTrigger>
                  <SelectContent>
                    {committees.map((committee) => (
                      <SelectItem key={committee} value={committee}>
                        {committee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookNumber">Book Number</Label>
                <Input
                  id="bookNumber"
                  placeholder="Enter book number"
                  value={searchData.bookNumber}
                  onChange={(e) => handleInputChange('bookNumber', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  placeholder="Enter receipt number"
                  value={searchData.receiptNumber}
                  onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSearching}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSearching ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Receipt
                  </>
                )}
              </Button>
              
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Verification Result
              </span>
              {searchResult.status === 'Genuine' ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Genuine
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="mr-1 h-3 w-3" />
                  Not Found
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResult.status === 'Genuine' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Receipt Date</Label>
                    <p className="text-sm font-semibold">{new Date(searchResult.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Trader Name</Label>
                    <p className="text-sm font-semibold">{searchResult.traderName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Commodity</Label>
                    <p className="text-sm font-semibold">{searchResult.commodity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Source Committee</Label>
                    <p className="text-sm font-semibold">{searchResult.sourceCommittee}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Destination Committee</Label>
                    <p className="text-sm font-semibold">{searchResult.destCommittee}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Quantity</Label>
                    <p className="text-sm font-semibold">{searchResult.quantity} Quintals</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Value</Label>
                    <p className="text-sm font-semibold">₹{searchResult.value.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fees Paid</Label>
                    <p className="text-sm font-semibold">₹{searchResult.feesPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Book Number</Label>
                    <p className="text-sm font-semibold">{searchResult.bookNumber}</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Verification Successful</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This receipt is genuine and verified in the AMC system.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">Invalid or Not Found</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  No matching receipt found with the provided details. Please verify the information and try again.
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
