import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, RotateCcw, Building2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Commodities in alphabetical order
const commodities = [
    'Bajra', 'Cotton', 'Gram', 'Jowar', 'Maize', 'Masur', 'Moong', 'Onion', 'Potato', 'Rice', 'Sugarcane', 'Tomato', 'Tur', 'Urad', 'Wheat'
];

// Unit options
const units = ['Quintals', 'Number', 'Bags'];

// Nature of receipt options
const natureOfReceipt = [
    { value: 'lf', label: 'Licence Fees (LF)' },
    { value: 'mf', label: 'Market Fees (MF)' },
    { value: 'uc', label: 'User Charges (UC)' },
    { value: 'others', label: 'Others' }
];

// Collection locations
const collectionLocations = ['checkpost', 'office'];

// Supervisors
const supervisors = ['supervisor_1', 'supervisor_2'];

// Tuni locations for checkpost
const tuniLocations = [
    'Tuni Main Checkpost',
    'Tuni Railway Station',
    'Tuni Bus Stand',
    'Tuni Market Yard',
    'Tuni Industrial Area'
];

const ReceiptEntry = ({ user }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filteredCommodities, setFilteredCommodities] = useState(commodities);
  const [commoditySearch, setCommoditySearch] = useState('');
  const [committees, setCommittees] = useState([]);
  const [userCommittee, setUserCommittee] = useState(null);
  const [userCommitteeData, setUserCommitteeData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    book_number: '',
    receipt_number: '',
    trader_name: '',
    trader_address: '',
    payee_name: '',
    payee_address: '',
    commodity: '',
    quantity: '',
    unit: '',
    value: '',
    nature_of_receipt: '',
    fees_paid: '',
    vehicle_number: '',
    invoice_number: '',
    collection_location: '',
    collected_by: '',
    checkpost_location: '',
    generated_by: '',
    designation: ''
  });
  
  const { toast } = useToast();

  // Load committees and user committee on component mount
  useEffect(() => {
    const loadCommittees = async () => {
      try {
        const { data: committeesData, error } = await supabase
          .from('committees')
          .select('id, name, code')
          .order('name');

        if (error) throw error;
        setCommittees(committeesData || []);

        console.log('All committees loaded:', committeesData);
        console.log('User committee from props:', user.committee);

        // Set user's committee if they have one
        if (user.committee) {
          setUserCommittee(user.committee);
          
          // Enhanced matching logic for committee lookup
          const userCommitteeLower = user.committee.toLowerCase().trim();
          
          const matchingCommittee = committeesData?.find(c => {
            const dbNameLower = c.name.toLowerCase();
            const dbCodeLower = c.code.toLowerCase();
            
            console.log(`Checking committee: "${c.name}" (code: "${c.code}") against user committee: "${user.committee}"`);
            
            // First try exact matches
            if (dbNameLower === userCommitteeLower || dbCodeLower === userCommitteeLower) {
              console.log('Found exact match:', c.name);
              return true;
            }
            
            // Special handling for specific known mappings
            if (userCommitteeLower === 'tuni amc' && dbNameLower.includes('tuni agricultural market committee')) {
              console.log('Found specific Tuni AMC match:', c.name);
              return true;
            }
            
            if (userCommitteeLower === 'kakinada amc' && dbNameLower.includes('kakinada agricultural market committee')) {
              console.log('Found specific Kakinada AMC match:', c.name);
              return true;
            }
            
            // Generic partial matching (more conservative)
            if (userCommitteeLower.includes('tuni') && dbNameLower.includes('tuni')) {
              console.log('Found Tuni partial match:', c.name);
              return true;
            }
            
            if (userCommitteeLower.includes('kakinada') && dbNameLower.includes('kakinada')) {
              console.log('Found Kakinada partial match:', c.name);
              return true;
            }
            
            // Code matching
            if (dbCodeLower === userCommitteeLower) {
              console.log('Found code match:', c.name);
              return true;
            }
            
            return false;
          });
          
          if (matchingCommittee) {
            setUserCommitteeData(matchingCommittee);
            console.log('Successfully matched committee:', matchingCommittee);
          } else {
            console.log('No matching committee found for:', user.committee);
            console.log('Available committees:', committeesData?.map(c => `${c.name} (${c.code})`));
          }
        }
      } catch (error) {
        console.error('Error loading committees:', error);
        toast({
          title: "Error loading committees",
          description: "Failed to load committee data. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    loadCommittees();
  }, [user, toast]);

  // Filter commodities based on search
  useEffect(() => {
    if (commoditySearch) {
      const filtered = commodities.filter(commodity =>
        commodity.toLowerCase().includes(commoditySearch.toLowerCase())
      );
      setFilteredCommodities(filtered);
    } else {
      setFilteredCommodities(commodities);
    }
  }, [commoditySearch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear dependent fields when collection_location changes
      if (field === 'collection_location') {
        newData.collected_by = '';
        newData.checkpost_location = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
        toast({ title: "Please select a date", variant: "destructive" });
        return;
    }

    if (!userCommitteeData) {
        toast({ 
          title: "No committee assigned", 
          description: `Committee "${user.committee}" not found in database. Please contact administrator.`, 
          variant: "destructive" 
        });
        return;
    }

    // Validate conditional fields
    if (formData.collection_location === 'office' && !formData.collected_by) {
        toast({ title: "Please select who collected the receipt", variant: "destructive" });
        return;
    }

    if (formData.collection_location === 'checkpost' && !formData.checkpost_location) {
        toast({ title: "Please select checkpost location", variant: "destructive" });
        return;
    }

    setLoading(true);

    try {
      // Create receipt object for Supabase
      const receiptData = {
        book_number: formData.book_number,
        receipt_number: formData.receipt_number,
        date: format(date, "yyyy-MM-dd"),
        trader_name: formData.trader_name,
        trader_address: formData.trader_address,
        payee_name: formData.payee_name,
        payee_address: formData.payee_address,
        commodity: formData.commodity,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        value: parseFloat(formData.value),
        nature_of_receipt: formData.nature_of_receipt,
        fees_paid: parseFloat(formData.fees_paid),
        vehicle_number: formData.vehicle_number,
        invoice_number: formData.invoice_number,
        collection_location: formData.collection_location,
        collected_by: formData.collection_location === 'office' ? formData.collected_by : null,
        checkpost_location: formData.collection_location === 'checkpost' ? formData.checkpost_location : null,
        generated_by: formData.generated_by,
        designation: formData.designation,
        committee_id: userCommitteeData.id,
        created_by: user.id,
        status: 'Active'
      };

      console.log('Inserting receipt data:', receiptData);

      const { data, error } = await supabase
        .from('receipts')
        .insert([receiptData])
        .select();

      if (error) throw error;

      toast({
        title: "Receipt Saved Successfully",
        description: `Receipt ${formData.receipt_number} has been added to ${userCommitteeData.name}.`,
      });
      
      handleReset();
    } catch (error) {
      console.error('Error saving receipt:', error);
      toast({
        title: "Error saving receipt",
        description: error.message || "Failed to save receipt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      book_number: '',
      receipt_number: '',
      trader_name: '',
      trader_address: '',
      payee_name: '',
      payee_address: '',
      commodity: '',
      quantity: '',
      unit: '',
      value: '',
      nature_of_receipt: '',
      fees_paid: '',
      vehicle_number: '',
      invoice_number: '',
      collection_location: '',
      collected_by: '',
      checkpost_location: '',
      generated_by: '',
      designation: ''
    });
    setDate(new Date());
    setCommoditySearch('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="mr-2 h-5 w-5" />
          New Receipt Entry - {userCommitteeData ? userCommitteeData.name : (userCommittee || 'No Committee Assigned')}
        </CardTitle>
        <CardDescription>
          Enter details for a new trade receipt for {userCommitteeData ? userCommitteeData.name : 'your assigned committee'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Committee Information Card */}
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Committee Information</h3>
                <p className="text-sm text-blue-700">
                  {userCommitteeData ? (
                    <>
                      <span className="font-semibold">{userCommitteeData.name}</span>
                      {userCommitteeData.district && (
                        <span className="ml-2">• District: {userCommitteeData.district}</span>
                      )}
                      <span className="ml-2">• Code: {userCommitteeData.code}</span>
                    </>
                  ) : (
                    <span className="text-red-600">
                      {userCommittee ? `Committee "${userCommittee}" not found in database` : 'No committee assigned'}
                    </span>
                  )}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  All receipts will be recorded under this committee for statistical tracking
                </p>
              </div>
            </div>
          </div>

          {/* Date and Receipt Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Receipt Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookNumber">Book Number</Label>
              <Input id="bookNumber" placeholder="Enter book number" value={formData.book_number} onChange={(e) => handleInputChange('book_number', e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt Number</Label>
              <Input id="receiptNumber" placeholder="Enter receipt number" value={formData.receipt_number} onChange={(e) => handleInputChange('receipt_number', e.target.value)} required />
            </div>
          </div>

          {/* Trader/Farmer and Payee Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trader/Farmer Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <h3 className="font-medium text-blue-900">Trader/Farmer Details</h3>
              <div className="space-y-2">
                <Label htmlFor="traderName">Trader/Farmer Name</Label>
                <Input id="traderName" placeholder="Enter trader/farmer name" value={formData.trader_name} onChange={(e) => handleInputChange('trader_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="traderAddress">Trader Address</Label>
                <Input id="traderAddress" placeholder="Enter trader address" value={formData.trader_address} onChange={(e) => handleInputChange('trader_address', e.target.value)} required />
              </div>
            </div>

            {/* Payee Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-green-50">
              <h3 className="font-medium text-green-900">Payee Details</h3>
              <div className="space-y-2">
                <Label htmlFor="payeeName">Payee Name</Label>
                <Input id="payeeName" placeholder="Enter payee name" value={formData.payee_name} onChange={(e) => handleInputChange('payee_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payeeAddress">Payee Address</Label>
                <Input id="payeeAddress" placeholder="Enter payee address" value={formData.payee_address} onChange={(e) => handleInputChange('payee_address', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Commodity and Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commoditySearch">Commodity</Label>
              <div className="space-y-2">
                <Input 
                  id="commoditySearch" 
                  placeholder="Search commodities..." 
                  value={commoditySearch} 
                  onChange={(e) => setCommoditySearch(e.target.value)} 
                />
                <Select value={formData.commodity} onValueChange={(value) => {
                  handleInputChange('commodity', value);
                  setCommoditySearch('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCommodities.map((commodity) => (
                      <SelectItem key={commodity} value={commodity}>
                        {commodity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" placeholder="Enter quantity" value={formData.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="natureOfReceipt">Nature of Receipt</Label>
              <Select value={formData.nature_of_receipt} onValueChange={(value) => handleInputChange('nature_of_receipt', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nature" />
                </SelectTrigger>
                <SelectContent>
                  {natureOfReceipt.map((nature) => (
                    <SelectItem key={nature.value} value={nature.value}>
                      {nature.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial and Transport Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value (₹)</Label>
              <Input id="value" type="number" placeholder="Enter value" value={formData.value} onChange={(e) => handleInputChange('value', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feesPaid">Fees Paid (₹)</Label>
              <Input id="feesPaid" type="number" placeholder="Enter fees paid" value={formData.fees_paid} onChange={(e) => handleInputChange('fees_paid', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input id="vehicleNumber" placeholder="Enter vehicle number" value={formData.vehicle_number} onChange={(e) => handleInputChange('vehicle_number', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" placeholder="Enter invoice number" value={formData.invoice_number} onChange={(e) => handleInputChange('invoice_number', e.target.value)} />
            </div>
          </div>

          {/* Collection Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="collectionLocation">Collection Location</Label>
              <Select value={formData.collection_location} onValueChange={(value) => handleInputChange('collection_location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {collectionLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location.charAt(0).toUpperCase() + location.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.collection_location === 'office' && (
              <div className="space-y-2">
                <Label htmlFor="collectedBy">Collected By</Label>
                <Select value={formData.collected_by} onValueChange={(value) => handleInputChange('collected_by', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor} value={supervisor}>
                        {supervisor.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.collection_location === 'checkpost' && (
              <div className="space-y-2">
                <Label htmlFor="checkpostLocation">Checkpost Location</Label>
                <Select value={formData.checkpost_location} onValueChange={(value) => handleInputChange('checkpost_location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select checkpost" />
                  </SelectTrigger>
                  <SelectContent>
                    {tuniLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Administrative Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="generatedBy">Generated By</Label>
              <Input id="generatedBy" placeholder="Enter who generated this receipt" value={formData.generated_by} onChange={(e) => handleInputChange('generated_by', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" placeholder="Enter designation" value={formData.designation} onChange={(e) => handleInputChange('designation', e.target.value)} required />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              <Save className="mr-2 h-4 w-4" /> 
              {loading ? 'Saving...' : 'Save Receipt'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceiptEntry;
