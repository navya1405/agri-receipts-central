
import { useState, useMemo } from 'react';

export const useReceiptFilters = (userAccessibleReceipts: any[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCommittee, setFilterCommittee] = useState('all');
  const [filterCommodity, setFilterCommodity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const commodities = useMemo(() => {
    if (!userAccessibleReceipts) return [];
    return [...new Set(userAccessibleReceipts.map(r => r.commodity))];
  }, [userAccessibleReceipts]);

  const filteredReceipts = useMemo(() => {
    return userAccessibleReceipts.filter(receipt => {
      const r = receipt as any;
      const matchesSearch = searchTerm === '' || 
        (r.trader_name && r.trader_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.payee_name && r.payee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.receipt_number && r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.book_number && r.book_number.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCommittee = filterCommittee === 'all' || 
        r.committeeName === filterCommittee;
      
      const matchesCommodity = filterCommodity === 'all' || 
        r.commodity === filterCommodity;

      return matchesSearch && matchesCommittee && matchesCommodity;
    });
  }, [userAccessibleReceipts, searchTerm, filterCommittee, filterCommodity]);

  return {
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
  };
};
