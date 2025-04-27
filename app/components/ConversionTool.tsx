import React from 'react';

interface ConversionToolProps {
  tool: {
    id: string;
    name: string;
    icon: React.ReactNode;
  };
}

export default function ConversionTool({ tool }: ConversionToolProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center space-x-2">
        {tool.icon}
        <h3>{tool.name}</h3>
      </div>
    </div>
  );
} 