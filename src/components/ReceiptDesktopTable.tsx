
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Edit, Eye } from "lucide-react";

interface ReceiptDesktopTableProps {
  receiptsLoading: boolean;
  filteredReceipts: any[];
  user: any;
}

export const ReceiptDesktopTable = ({ receiptsLoading, filteredReceipts, user }: ReceiptDesktopTableProps) => {
  return (
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
  );
};
