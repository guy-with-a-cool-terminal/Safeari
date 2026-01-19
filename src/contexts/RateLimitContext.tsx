import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import UpgradeModal from '@/components/modals/UpgradeModal';
import { setGlobalRateLimitHandler } from '@/lib/api/client';

interface RateLimitContextType {
  showRateLimitModal: (feature: string, currentTier: string, requiredTier: string) => void;
}

const RateLimitContext = createContext<RateLimitContextType | undefined>(undefined);

export const RateLimitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    feature: '',
    currentTier: 'free',
    requiredTier: 'basic'
  });

  const showRateLimitModal = useCallback((feature: string, currentTier: string, requiredTier: string) => {
    setModalData({ feature, currentTier, requiredTier });
    setIsOpen(true);
  }, []);

  // Register global handler on mount
  useEffect(() => {
    setGlobalRateLimitHandler(showRateLimitModal);
    return () => setGlobalRateLimitHandler(null);
  }, [showRateLimitModal]);

  return (
    <RateLimitContext.Provider value={{ showRateLimitModal }}>
      {children}
      <UpgradeModal
        open={isOpen}
        onOpenChange={setIsOpen}
        feature={modalData.feature}
        currentTier={modalData.currentTier}
        requiredTier={modalData.requiredTier}
        isRateLimit={true}
      />
    </RateLimitContext.Provider>
  );
};

export const useRateLimit = () => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimit must be used within RateLimitProvider');
  }
  return context;
};