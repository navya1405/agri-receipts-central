
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Building2 } from "lucide-react";
import { useReceiptData } from '@/hooks/useReceiptData';
import { useReceiptFilters } from '@/hooks/useReceiptFilters';
import { handleExport, getReceiptListTitle, getReceiptListDescription } from '@/utils/receiptUtils';
import { ReceiptFilters } from './ReceiptFilters';
import { ReceiptMobileView } from './ReceiptMobileView';
import { ReceiptDesktopTable } from './ReceiptDesktopTable';

const ReceiptList = ({ user }) => {
  const { receiptsLoading, committeesLoading, filteredCommittees, userAccessibleReceipts, userCommitteeId } = useReceiptData(user);
  
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
          {/* Committee Access Debug Info - only show for Supervisor and DEO */}
          {(user.role === 'Supervisor' || user.role === 'DEO') && (
            <div className="mb-4 p-3 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-2 text-sm">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Committee Access:</span>
                <span className="text-blue-700">
                  {user.committee} {userCommitteeId ? `(ID: ${userCommitteeId.slice(0, 8)}...)` : '(Not Found)'}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                You can only see receipts from your assigned committee. Found {userAccessibleReceipts.length} accessible receipts.
              </div>
            </div>
          )}

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
