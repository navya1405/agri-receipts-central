
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, RotateCcw } from "lucide-react";
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

const ReceiptEntry = ({ user }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filteredCommodities, setFilteredCommodities] = useState(commodities);
  const [commoditySearch, setCommoditySearch] = useState('');
  const [committees, setCommittees] = useState([]);
  const [userCommittee, setUserCommittee] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    seller_name: '',
    buyer_name: '',
    book_number: '',
    receipt_number: '',
    commodity: '',
    quantity: '',
    unit: '',
    value: '',
    fees_paid: '',
    trader_license: ''
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

        // Set user's committee if they have one
        if (user.committee) {
          setUserCommittee(user.committee);
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
        toast({ title: "Please select a date", variant: "destructive" });
        return;
    }

    if (!userCommittee) {
        toast({ title: "No committee assigned", description: "Please contact administrator to assign a committee.", variant: "destructive" });
        return;
    }

    setLoading(true);

    try {
      // Get the committee ID for the user's committee
      const userCommitteeData = committees.find(c => c.name === userCommittee);
      if (!userCommitteeData) {
        throw new Error("User committee not found");
      }

      // Create receipt object for Supabase
      const receiptData = {
        book_number: formData.book_number,
        receipt_number: formData.receipt_number,
        date: format(date, "yyyy-MM-dd"),
        seller_name: formData.seller_name,
        buyer_name: formData.buyer_name,
        commodity: formData.commodity,
        quantity: parseFloat(formData.quantity),
        value: parseFloat(formData.value),
        fees_paid: parseFloat(formData.fees_paid),
        seller_committee_id: userCommitteeData.id,
        buyer_committee_id: userCommitteeData.id, // Same committee for now
        created_by: user.id,
        trader_license: formData.trader_license,
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
        description: `Receipt ${formData.receipt_number} has been added to ${userCommittee}.`,
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
      seller_name: '',
      buyer_name: '',
      book_number: '',
      receipt_number: '',
      commodity: '',
      quantity: '',
      unit: '',
      value: '',
      fees_paid: '',
      trader_license: ''
    });
    setDate(new Date());
    setCommoditySearch('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="mr-2 h-5 w-5" />
          New Receipt Entry - {userCommittee || 'No Committee Assigned'}
        </CardTitle>
        <CardDescription>
          Enter details for a new trade receipt for {userCommittee || 'your assigned committee'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Trader/Farmer and Buyer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seller Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
              <h3 className="font-medium text-blue-900">Seller Details</h3>
              <div className="space-y-2">
                <Label htmlFor="sellerName">Seller Name</Label>
                <Input id="sellerName" placeholder="Enter seller name" value={formData.seller_name} onChange={(e) => handleInputChange('seller_name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="traderLicense">Trader License</Label>
                <Input id="traderLicense" placeholder="Enter trader license number" value={formData.trader_license} onChange={(e) => handleInputChange('trader_license', e.target.value)} />
              </div>
            </div>

            {/* Buyer Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-green-50">
              <h3 className="font-medium text-green-900">Buyer Details</h3>
              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer Name</Label>
                <Input id="buyerName" placeholder="Enter buyer name" value={formData.buyer_name} onChange={(e) => handleInputChange('buyer_name', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Commodity and Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value (₹)</Label>
              <Input id="value" type="number" placeholder="Enter value" value={formData.value} onChange={(e) => handleInputChange('value', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feesPaid">Fees Paid (₹)</Label>
              <Input id="feesPaid" type="number" placeholder="Enter fees paid" value={formData.fees_paid} onChange={(e) => handleInputChange('fees_paid', e.target.value)} required />
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
