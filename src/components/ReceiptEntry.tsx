
import { useState } from 'react';
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

const ReceiptEntry = ({ user }) => {
  const [date, setDate] = useState(new Date());
  const [formData, setFormData] = useState({
    sourceCommittee: '',
    destCommittee: '',
    traderName: '',
    bookNumber: '',
    receiptNumber: '',
    commodity: '',
    quantity: '',
    value: '',
    feesPaid: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const committees = [
    'Mumbai AMC', 'Pune AMC', 'Nashik AMC', 'Nagpur AMC', 'Aurangabad AMC',
    'Kolhapur AMC', 'Sangli AMC', 'Solapur AMC', 'Ahmednagar AMC', 'Satara AMC'
  ];

  const commodities = [
    'Rice', 'Wheat', 'Jowar', 'Bajra', 'Maize', 'Tur', 'Gram', 'Moong',
    'Urad', 'Masur', 'Cotton', 'Sugarcane', 'Onion', 'Potato', 'Tomato'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Receipt Saved Successfully",
        description: `Receipt ${formData.receiptNumber} has been added to the system.`,
      });
      
      // Reset form
      setFormData({
        sourceCommittee: '',
        destCommittee: '',
        traderName: '',
        bookNumber: '',
        receiptNumber: '',
        commodity: '',
        quantity: '',
        value: '',
        feesPaid: ''
      });
      setDate(new Date());
      setIsSubmitting(false);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      sourceCommittee: '',
      destCommittee: '',
      traderName: '',
      bookNumber: '',
      receiptNumber: '',
      commodity: '',
      quantity: '',
      value: '',
      feesPaid: ''
    });
    setDate(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="mr-2 h-5 w-5" />
          New Receipt Entry
        </CardTitle>
        <CardDescription>
          Enter details for a new AMC trade receipt
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Committee Details */}
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
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceCommittee">Source Committee</Label>
              <Select value={formData.sourceCommittee} onValueChange={(value) => handleInputChange('sourceCommittee', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source committee" />
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
              <Label htmlFor="destCommittee">Destination Committee</Label>
              <Select value={formData.destCommittee} onValueChange={(value) => handleInputChange('destCommittee', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination committee" />
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
          </div>

          {/* Trader and Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="traderName">Trader Name</Label>
              <Input
                id="traderName"
                placeholder="Enter trader name"
                value={formData.traderName}
                onChange={(e) => handleInputChange('traderName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookNumber">Book Number</Label>
              <Input
                id="bookNumber"
                placeholder="Enter book number"
                value={formData.bookNumber}
                onChange={(e) => handleInputChange('bookNumber', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt Number</Label>
              <Input
                id="receiptNumber"
                placeholder="Enter receipt number"
                value={formData.receiptNumber}
                onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Commodity and Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commodity">Commodity</Label>
              <Select value={formData.commodity} onValueChange={(value) => handleInputChange('commodity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
                <SelectContent>
                  {commodities.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Quintals)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value (₹)</Label>
              <Input
                id="value"
                type="number"
                placeholder="Enter value"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feesPaid">Fees Paid (₹)</Label>
              <Input
                id="feesPaid"
                type="number"
                placeholder="Enter fees paid"
                value={formData.feesPaid}
                onChange={(e) => handleInputChange('feesPaid', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Receipt
                </>
              )}
            </Button>
            
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceiptEntry;
