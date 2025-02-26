interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    onMouseLeave: (e: React.MouseEvent) => void;
    mousePosition?: { x: number; y: number };
  }
  
  export function PreviewModal({ isOpen, onClose, url, onMouseLeave, mousePosition }: PreviewModalProps) {
    if (!isOpen) return null;
  
    // Calculate position based on mouse coordinates
    const getModalPosition = () => {
      if (!mousePosition) return {};
      
      const modalWidth = window.innerWidth >= 768 ? 600 : window.innerWidth * 0.95;
      const modalHeight = window.innerWidth >= 768 ? 400 : 300;
      const padding = 20; // Space between modal and viewport edges
      
      // Center horizontally on mouse position
      let left = mousePosition.x - (modalWidth / 2);
      // Start by positioning above the mouse
      let top = mousePosition.y - modalHeight - 10; // Reduced padding for closer positioning

      // Boundary checks
      // Right edge
      if (left + modalWidth > window.innerWidth - padding) {
        left = window.innerWidth - modalWidth - padding;
      }
      // Left edge
      if (left < padding) {
        left = padding;
      }
      // Top edge - if not enough space above, position below
      if (top < padding) {
        top = mousePosition.y + 10; // Position below cursor with small offset
      }
      // Bottom edge
      if (top + modalHeight > window.innerHeight - padding) {
        top = window.innerHeight - modalHeight - padding;
      }

      return {
        position: 'fixed' as const,
        top: `${top}px`,
        left: `${left}px`,
        transform: 'none',
        pointerEvents: 'auto' as const // Type as const to match CSS property type
      };
    };
  
    return (
      <div 
        data-preview-window
        onMouseLeave={onMouseLeave}
        className="fixed z-50 transition-all duration-300 ease-in-out opacity-0 data-[show=true]:opacity-100" 
        data-show={isOpen}
        style={{ 
          ...getModalPosition(),
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 300ms ease-in-out, visibility 300ms ease-in-out'
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg w-[95vw] md:w-[600px] h-[300px] md:h-[400px] shadow-2xl relative border border-gray-200 dark:border-gray-700">
          <div className="absolute top-0 left-0 right-0 bg-gray-100 px-2 py-1 rounded-t-lg flex items-center">
            <span className="text-sm text-gray-600 truncate flex-1">{url}</span>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
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