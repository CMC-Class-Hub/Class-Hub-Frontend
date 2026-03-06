'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AlertOptions {
  title: string;
  description?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({ title: '' });

  const showAlert = useCallback((opts: AlertOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (options.onConfirm) {
      options.onConfirm();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText || '확인'}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
        cancelText="" // 빈 문자열로 전달하여 취소 버튼 숨김
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
