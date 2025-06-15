
import { useMemo } from 'react';
import { useReceipts, useCommittees } from './useReceipts';

export const useReceiptData = (user: any) => {
  const { data: receipts, isLoading: receiptsLoading } = useReceipts();
  const { data: committees, isLoading: committeesLoading } = useCommittees();

  const committeeMap = useMemo(() => {
    if (!committees) return new Map();
    return new Map(committees.map(c => [c.id, c.name]));
  }, [committees]);

  // Get user's actual committee ID from the committees table
  const userCommitteeId = useMemo(() => {
    if (!committees || !user.committee) return null;
    
    // Find the committee that matches the user's assigned committee name
    const userCommittee = committees.find(committee => {
      const committeeName = committee.name.toLowerCase();
      const userCommitteeName = user.committee.toLowerCase();
      
      // Exact matching for known committees
      if (userCommitteeName === 'kakinada amc' && committeeName.includes('kakinada')) {
        return true;
      }
      if (userCommitteeName === 'tuni amc' && committeeName.includes('tuni')) {
        return true;
      }
      
      // Generic exact matching
      return committeeName === userCommitteeName;
    });
    
    return userCommittee?.id || null;
  }, [committees, user.committee]);

  // Filter committees based on user role and exact committee ID
  const filteredCommittees = useMemo(() => {
    if (!committees) return [];
    
    // JD can see all committees
    if (user.role === 'JD') {
      return committees;
    }
    
    // Supervisor and DEO should only see their assigned committee
    if (user.role === 'Supervisor' || user.role === 'DEO') {
      if (!userCommitteeId) {
        console.warn(`User ${user.username} has committee "${user.committee}" but no matching committee found in database`);
        return [];
      }
      
      return committees.filter(committee => committee.id === userCommitteeId);
    }
    
    return [];
  }, [committees, user.role, userCommitteeId]);
  
  const allReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.map(r => ({
      ...r,
      committeeName: committeeMap.get(r.committee_id) || 'Unknown Committee'
    }));
  }, [receipts, committeeMap]);

  // Filter receipts based on user role and exact committee access
  const userAccessibleReceipts = useMemo(() => {
    if (!allReceipts.length) return [];
    
    // JD can see all receipts
    if (user.role === 'JD') {
      return allReceipts;
    }
    
    // Supervisor and DEO should only see receipts from their committee
    if (user.role === 'Supervisor' || user.role === 'DEO') {
      if (!userCommitteeId) {
        console.warn(`User ${user.username} has no valid committee ID, returning empty receipts`);
        return [];
      }
      
      const filteredReceipts = allReceipts.filter(receipt => 
        receipt.committee_id === userCommitteeId
      );
      
      console.log(`User ${user.username} (${user.committee}) can access ${filteredReceipts.length} receipts from committee ID: ${userCommitteeId}`);
      
      return filteredReceipts;
    }
    
    return [];
  }, [allReceipts, user.role, user.username, user.committee, userCommitteeId]);

  return {
    receiptsLoading,
    committeesLoading,
    filteredCommittees,
    userAccessibleReceipts,
    userCommitteeId // Export this for debugging
  };
};
