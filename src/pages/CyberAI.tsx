import React from 'react';
import CyberChat from '@/components/chat/CyberChat';

const CyberAI = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-background">
      <div className="w-full max-w-2xl bg-cyber-card/80 border border-cyber-accent/20 rounded-2xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-cyber-foreground mb-6 text-center">
          Cyber Intelligence Assistant
        </h1>
        <CyberChat />
      </div>
    </div>
  );
};

export default CyberAI; 