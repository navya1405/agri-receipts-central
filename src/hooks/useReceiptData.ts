
import { useMemo } from 'react';
import { useReceipts, useCommittees } from './useReceipts';

export const useReceiptData = (user: any) => {
  const { data: receipts, isLoading: receiptsLoading } = useReceipts();
  const { data: committees, isLoading: committeesLoading } = useCommittees();

  const committeeMap = useMemo(() => {
    if (!committees) return new Map();
    return new Map(committees.map(c => [c.id, c.name]));
  }, [committees]);

  // Filter committees based on user role
  const filteredCommittees = useMemo(() => {
    if (!committees) return [];
    
    // JD can see all committees
    if (user.role === 'JD') {
      return committees;
    }
    
    // Supervisor and DEO should only see their assigned committee
    if (user.role === 'Supervisor' || user.role === 'DEO') {
      const userCommittee = user.committee?.toLowerCase() || '';
      
      return committees.filter(committee => {
        const committeeName = committee.name.toLowerCase();
        
        // Try to match the user's committee with the database committee
        if (userCommittee === 'kakinada amc' && committeeName.includes('kakinada')) {
          return true;
        }
        if (userCommittee === 'tuni amc' && committeeName.includes('tuni')) {
          return true;
        }
        
        // Generic matching for other cases
        return committeeName.includes(userCommittee) || userCommittee.includes(committeeName);
      });
    }
    
    return [];
  }, [committees, user.role, user.committee]);
  
  const allReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.map(r => ({
      ...r,
      committeeName: committeeMap.get(r.committee_id) || 'Unknown Committee'
    }));
  }, [receipts, committeeMap]);

  // Filter receipts based on user role and committee access
  const userAccessibleReceipts = useMemo(() => {
    if (!allReceipts.length) return [];
    
    // JD can see all receipts
    if (user.role === 'JD') {
      return allReceipts;
    }
    
    // Supervisor and DEO should only see receipts from their committee
    if (user.role === 'Supervisor' || user.role === 'DEO') {
      const allowedCommitteeNames = filteredCommittees.map(c => c.name);
      return allReceipts.filter(receipt => 
        allowedCommitteeNames.includes(receipt.committeeName)
      );
    }
    
    return [];
  }, [allReceipts, user.role, filteredCommittees]);

  return {
    receiptsLoading,
    committeesLoading,
    filteredCommittees,
    userAccessibleReceipts
  };
};
