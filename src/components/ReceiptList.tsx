
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Search, Filter, Calendar, Edit, Eye } from "lucide-react";

const ReceiptList = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommittee, setFilterCommittee] = useState('');
  const [filterCommodity, setFilterCommodity] = useState('');

  // Mock data for receipts
  const mockReceipts = [
    {
      id: '1',
      date: '2024-06-12',
      bookNumber: 'BK001',
      receiptNumber: 'R001',
      traderName: 'Rajesh Traders',
      sourceCommittee: 'Mumbai AMC',
      destCommittee: 'Pune AMC',
      commodity: 'Rice',
      quantity: 50,
      value: 125000,
      feesPaid: 2500,
      status: 'Active',
      createdBy: 'DEO001'
    },
    {
      id: '2',
      date: '2024-06-13',
      bookNumber: 'BK002',
      receiptNumber: 'R002',
      traderName: 'Shankar Agro',
      sourceCommittee: 'Pune AMC',
      destCommittee: 'Nashik AMC',
      commodity: 'Wheat',
      quantity: 75,
      value: 187500,
      feesPaid: 3750,
      status: 'Active',
      createdBy: 'DEO002'
    },
    {
      id: '3',
      date: '2024-06-14',
      bookNumber: 'BK003',
      receiptNumber: 'R003',
      traderName: 'Mahesh Enterprises',
      sourceCommittee: 'Mumbai AMC',
      destCommittee: 'Kolhapur AMC',
      commodity: 'Cotton',
      quantity: 100,
      value: 300000,
      feesPaid: 6000,
      status: 'Active',
      createdBy: 'DEO001'
    }
  ];

  const committees = [
    'Mumbai AMC', 'Pune AMC', 'Nashik AMC', 'Nagpur AMC', 'Aurangabad AMC',
    'Kolhapur AMC', 'Sangli AMC', 'Solapur AMC', 'Ahmednagar AMC', 'Satara AMC'
  ];

  const commodities = [
    'Rice', 'Wheat', 'Jowar', 'Bajra', 'Maize', 'Tur', 'Gram', 'Moong',
    'Urad', 'Masur', 'Cotton', 'Sugarcane', 'Onion', 'Potato', 'Tomato'
  ];

  const filteredReceipts = mockReceipts.filter(receipt => {
    const matchesSearch = searchTerm === '' || 
      receipt.traderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.bookNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCommittee = filterCommittee === '' || 
      receipt.sourceCommittee === filterCommittee || 
      receipt.destCommittee === filterCommittee;
    
    const matchesCommodity = filterCommodity === '' || 
      receipt.commodity === filterCommodity;

    return matchesSearch && matchesCommittee && matchesCommodity;
  });

  const handleExport = () => {
    // Mock export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Book Number,Receipt Number,Trader Name,Source Committee,Destination Committee,Commodity,Quantity,Value,Fees Paid\n"
      + filteredReceipts.map(receipt => 
          `${receipt.date},${receipt.bookNumber},${receipt.receiptNumber},${receipt.traderName},${receipt.sourceCommittee},${receipt.destCommittee},${receipt.commodity},${receipt.quantity},${receipt.value},${receipt.feesPaid}`
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
      case 'DEO': return 'View and manage receipts you have entered';
      case 'Supervisor': return `View all receipts for ${user.committee}`;
      case 'JD': return 'View all receipts across all committees';
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
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by trader name, receipt number, or book number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={filterCommittee} onValueChange={setFilterCommittee}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by committee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Committees</SelectItem>
                  {committees.map((committee) => (
                    <SelectItem key={committee} value={committee}>
                      {committee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Select value={filterCommodity} onValueChange={setFilterCommodity}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by commodity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Commodities</SelectItem>
                  {commodities.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Receipt Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Book/Receipt</TableHead>
                  <TableHead>Trader</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">
                        {new Date(receipt.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{receipt.bookNumber}</div>
                          <div className="text-gray-500">{receipt.receiptNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{receipt.traderName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{receipt.sourceCommittee}</div>
                          <div className="text-gray-500">→ {receipt.destCommittee}</div>
                        </div>
                      </TableCell>
                      <TableCell>{receipt.commodity}</TableCell>
                      <TableCell>{receipt.quantity} Q</TableCell>
                      <TableCell>₹{receipt.value.toLocaleString()}</TableCell>
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
                          {(user.role === 'DEO' && receipt.createdBy === user.username) && (
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
                        <p>No receipts found matching your criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredReceipts.length} of {mockReceipts.length} receipts
            </span>
            <span>
              Total Value: ₹{filteredReceipts.reduce((sum, receipt) => sum + receipt.value, 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptList;
