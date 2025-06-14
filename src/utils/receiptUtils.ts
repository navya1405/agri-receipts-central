
export const handleExport = (filteredReceipts: any[]) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Date,Book Number,Receipt Number,Trader Name,Payee Name,Committee,Commodity,Quantity,Unit,Value,Fees Paid\n"
    + filteredReceipts.map((receipt: any) => 
        `${receipt.date},${receipt.book_number},${receipt.receipt_number},${receipt.trader_name},${receipt.payee_name},${receipt.committeeName},${receipt.commodity},${receipt.quantity},${receipt.unit},${receipt.value},${receipt.fees_paid}`
      ).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "amc_receipts.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getReceiptListTitle = (userRole: string) => {
  switch (userRole) {
    case 'DEO': return 'My Receipts';
    case 'Supervisor': return 'Committee Receipts';
    case 'JD': return 'All Receipts';
    default: return 'Receipts';
  }
};

export const getReceiptListDescription = (userRole: string) => {
  switch (userRole) {
    case 'DEO': return 'View and manage receipts you have created';
    case 'Supervisor': return 'View receipts for your assigned committee';
    case 'JD': return 'Complete overview of all receipts in the system';
    default: return 'View receipt records';
  }
};
