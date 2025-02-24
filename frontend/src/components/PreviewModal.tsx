interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    onMouseLeave: (e: React.MouseEvent) => void;
  }
  
  export function PreviewModal({ isOpen, onClose, url, onMouseLeave }: PreviewModalProps) {
    if (!isOpen) return null;
  
  
    return (
      <div 
        data-preview-window
        onMouseLeave={onMouseLeave}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out opacity-0 data-[show=true]:opacity-100" 
        data-show={isOpen}
        style={{ 
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 300ms ease-in-out, visibility 300ms ease-in-out'
        }}
      >
        <div className="bg-white rounded-lg w-[600px] h-[400px] shadow-2xl relative border border-gray-200">
          <div className="absolute top-0 left-0 right-0 bg-gray-100 px-2 py-1 rounded-t-lg flex items-center">
            <span className="text-sm text-gray-600 truncate flex-1">{url}</span>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {
            <iframe 
              src={url} 
              className="w-full h-full pt-7 rounded-b-lg"
              title="Preview"
            />
          }
        </div>
      </div>
    );
  }