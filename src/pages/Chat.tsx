import React from 'react';
import CyberChat from '@/components/chat/CyberChat';

const Chat = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-cyber-foreground mb-8">
        Cyber Intelligence Chat
      </h1>
      <div className="bg-cyber-card/50 border border-cyber-accent/20 rounded-lg shadow-lg">
        <CyberChat />
      </div>
    </div>
  );
};

export default Chat; 