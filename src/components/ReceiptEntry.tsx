
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchCommittees = async () => {
    const { data, error } = await supabase.from('committees').select('id, name');
    if (error) throw new Error(error.message);
    return data;
}

// Mock commodities for now as they are not in the DB
const commodities = [
    'Rice', 'Wheat', 'Jowar', 'Bajra', 'Maize', 'Tur', 'Gram', 'Moong',
    'Urad', 'Masur', 'Cotton', 'Sugarcane', 'Onion', 'Potato', 'Tomato'
];

const ReceiptEntry = ({ user }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    source_committee_id: '',
    dest_committee_id: '',
    trader_name: '',
    book_number: '',
    receipt_number: '',
    commodity: '',
    quantity: '',
    value: '',
    fees_paid: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: committees, isLoading: committeesLoading } = useQuery({ queryKey: ['committees'], queryFn: fetchCommittees });

  const mutation = useMutation({
    mutationFn: (newReceipt: any) => supabase.from('receipts').insert(newReceipt),
    onSuccess: () => {
      toast({
        title: "Receipt Saved Successfully",
        description: `Receipt ${formData.receipt_number} has been added.`,
      });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      handleReset();
    },
    onError: (error: any) => {
        toast({
            title: "Error saving receipt",
            description: error.message,
            variant: "destructive"
        })
    }
  });
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
        toast({ title: "Please select a date", variant: "destructive" });
        return;
    }
    mutation.mutate({ 
        ...formData,
        date: format(date, "yyyy-MM-dd"),
        created_by: user.id,
    });
  };

  const handleReset = () => {
    setFormData({
      source_committee_id: '',
      dest_committee_id: '',
      trader_name: '',
      book_number: '',
      receipt_number: '',
      commodity: '',
      quantity: '',
      value: '',
      fees_paid: ''
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
              <Label htmlFor="sourceCommittee">Source Committee</Label>
              <Select value={formData.source_committee_id} onValueChange={(value) => handleInputChange('source_committee_id', value)} disabled={committeesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source committee" />
                </SelectTrigger>
                <SelectContent>
                  {committees?.map((committee) => (
                    <SelectItem key={committee.id} value={committee.id}>
                      {committee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destCommittee">Destination Committee</Label>
              <Select value={formData.dest_committee_id} onValueChange={(value) => handleInputChange('dest_committee_id', value)} disabled={committeesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination committee" />
                </SelectTrigger>
                <SelectContent>
                  {committees?.map((committee) => (
                    <SelectItem key={committee.id} value={committee.id}>
                      {committee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="traderName">Trader Name</Label>
              <Input id="traderName" placeholder="Enter trader name" value={formData.trader_name} onChange={(e) => handleInputChange('trader_name', e.target.value)} required />
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
              <Input id="quantity" type="number" placeholder="Enter quantity" value={formData.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} required />
            </div>
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
            <Button type="submit" disabled={mutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {mutation.isPending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Receipt</>}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReceiptEntry;
