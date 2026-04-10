import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { predictions as predictionsApi } from '../utils/api';

const AdvisoryContext = createContext(null);

export const AdvisoryProvider = ({ children, isAuthenticated }) => {
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(false);
  const fetchedRef = useRef(false);

  const fetchAudit = async () => {
    setAuditLoading(true);
    setAuditError(false);
    try {
      const res = await predictionsApi.globalAudit();
      setAuditData(res.data);
    } catch {
      setAuditError(true);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchAudit();
    }
  }, [isAuthenticated]);

  const refreshAudit = () => {
    fetchAudit();
  };

  return (
    <AdvisoryContext.Provider value={{ auditData, auditLoading, auditError, refreshAudit }}>
      {children}
    </AdvisoryContext.Provider>
  );
};

export const useAdvisory = () => {
  const ctx = useContext(AdvisoryContext);
  if (!ctx) throw new Error('useAdvisory must be used within AdvisoryProvider');
  return ctx;
};
