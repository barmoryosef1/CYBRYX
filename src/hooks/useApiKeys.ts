import { useState } from 'react';

interface ApiKeys {
  virusTotal: string;
  otx: string;
}

// This is a legacy hook that is no longer used 
// as API keys are now stored as Supabase secrets
export const useApiKeys = () => {
  const [apiKeys] = useState<ApiKeys>({
    virusTotal: '',
    otx: '',
  });

  const setVirustotalKey = () => {
    // No operation - API keys now managed via Supabase secrets
  };

  const setOtxKey = () => {
    // No operation - API keys now managed via Supabase secrets
  };

  return {
    apiKeys,
    setVirustotalKey,
    setOtxKey,
  };
};
