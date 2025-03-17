import { useEffect } from 'react';

function ForceDesktopView() {
  useEffect(() => {
    // Find the viewport meta tag
    let viewport = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create it
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    // Set the content to force desktop view
    viewport.content = 'width=1024';
    
    // Optional: Add CSS for minimum width
    document.body.style.minWidth = '1024px';
    document.body.style.overflowX = 'auto';
    
    // Optional: Prevent zooming (use cautiously as it affects accessibility)
    // viewport.content = 'width=1024, user-scalable=no';
    
    return () => {
      // Clean up if component unmounts (though typically wouldn't revert this)
      viewport.content = 'width=device-width, initial-scale=1';
    };
  }, []);
  
  return null; // This component doesn't render anything
}

export default ForceDesktopView;