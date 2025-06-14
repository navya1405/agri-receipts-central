
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Edit, Eye } from "lucide-react";

interface ReceiptMobileViewProps {
  receiptsLoading: boolean;
  filteredReceipts: any[];
  user: any;
}

export const ReceiptMobileView = ({ receiptsLoading, filteredReceipts, user }: ReceiptMobileViewProps) => {
  if (receiptsLoading) {
    return (
      <div className="block sm:hidden space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredReceipts.length === 0) {
    return (
      <div className="block sm:hidden space-y-4">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-gray-500">No receipts found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="block sm:hidden space-y-4">
      {filteredReceipts.map((receipt: any) => (
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
      ))}
    </div>
  );
};
