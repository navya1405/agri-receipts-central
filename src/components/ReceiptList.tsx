
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useReceiptData } from '@/hooks/useReceiptData';
import { useReceiptFilters } from '@/hooks/useReceiptFilters';
import { handleExport, getReceiptListTitle, getReceiptListDescription } from '@/utils/receiptUtils';
import { ReceiptFilters } from './ReceiptFilters';
import { ReceiptMobileView } from './ReceiptMobileView';
import { ReceiptDesktopTable } from './ReceiptDesktopTable';

const ReceiptList = ({ user }) => {
  const { receiptsLoading, committeesLoading, filteredCommittees, userAccessibleReceipts } = useReceiptData(user);
  
  const {
    searchTerm,
    setSearchTerm,
    filterCommittee,
    setFilterCommittee,
    filterCommodity,
    setFilterCommodity,
    showFilters,
    setShowFilters,
    commodities,
    filteredReceipts
  } = useReceiptFilters(userAccessibleReceipts);

  const onExport = () => handleExport(filteredReceipts);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="flex items-center">
              <FileText className="mr-2 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{getReceiptListTitle(user.role)}</span>
            </span>
            {(user.role === 'Supervisor' || user.role === 'JD') && (
              <Button onClick={onExport} variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-sm">
            {getReceiptListDescription(user.role)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReceiptFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCommittee={filterCommittee}
            setFilterCommittee={setFilterCommittee}
            filterCommodity={filterCommodity}
            setFilterCommodity={setFilterCommodity}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filteredCommittees={filteredCommittees}
            commodities={commodities}
            committeesLoading={committeesLoading}
            receiptsLoading={receiptsLoading}
          />

          <ReceiptMobileView
            receiptsLoading={receiptsLoading}
            filteredReceipts={filteredReceipts}
            user={user}
          />

          <ReceiptDesktopTable
            receiptsLoading={receiptsLoading}
            filteredReceipts={filteredReceipts}
            user={user}
          />

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
