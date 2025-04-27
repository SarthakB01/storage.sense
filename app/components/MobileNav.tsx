import React from 'react';

type ActiveTab = "storage" | "myFiles" | "starred" | "analytics" | "tools";
type ActiveTool = "wordToPdf" | "pdfToWord" | "imageResize" | "imageConvert" | "pdfMerge" | null;

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setActiveTool: (tool: ActiveTool) => void;
}

export default function MobileNav({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  setActiveTool 
}: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 h-full w-64 p-4">
        <button onClick={onClose}>Close</button>
        <nav className="mt-4">
          <button 
            onClick={() => {
              setActiveTab('storage');
              setActiveTool(null);
              onClose();
            }}
            className={`block w-full text-left p-2 ${activeTab === 'storage' ? 'bg-violet-100' : ''}`}
          >
            Home
          </button>
          {/* Add more navigation items as needed */}
        </nav>
      </div>
    </div>
  );
} 