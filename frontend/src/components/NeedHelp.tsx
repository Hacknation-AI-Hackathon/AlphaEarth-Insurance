import React from "react";

export const NeedHelp = () => {
  return (
    <div style={{width: 218, height: 169.50, position: 'relative'}}>
      {/* Background layers */}
      <div style={{width: 218, height: 169.50, left: 0, top: 0, position: 'absolute', background: '#0075FF', borderRadius: 15}} />
      <div style={{width: 218, height: 169.50, left: 0, top: 0, position: 'absolute', background: '#4FD1C5', borderRadius: 15}} />
      
      {/* Documentation Button */}
      <button 
        onClick={() => {
          // Add navigation to documentation page when ready
          window.open('/docs', '_blank');
        }}
        style={{width: 186, height: 35, paddingLeft: 8, paddingRight: 8, left: 16, top: 118.50, position: 'absolute', background: 'linear-gradient(175deg, rgba(5.91, 11.17, 39.61, 0.74) 0%, rgba(9.54, 14, 35.36, 0.71) 100%)', borderRadius: 12, backdropFilter: 'blur(5px)', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', border: 'none', cursor: 'pointer'}}
      >
        <div style={{overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
          <div style={{height: 24, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
            <div style={{overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
              <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 10, fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '700', lineHeight: 10, wordWrap: 'break-word'}}>DOCUMENTATION</div>
            </div>
          </div>
          <div style={{paddingLeft: 12, paddingRight: 12, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{width: 0.01, height: 0.01, background: '#C4C4C4'}} />
          </div>
        </div>
      </button>
      
      {/* Text content */}
      <div style={{left: 16.50, top: 95, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 12, fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '400', lineHeight: 12, wordWrap: 'break-word'}}>Please check our docs</div>
      <div style={{left: 16, top: 71.50, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 14, fontFamily: 'Plus Jakarta Display, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '700', lineHeight: 19.60, wordWrap: 'break-word'}}>Need help?</div>
      
      {/* Icon container */}
      <div style={{width: 35, height: 35, left: 16.50, top: 16, position: 'absolute', background: 'white', borderRadius: 12}} />
      <div style={{width: 24, height: 24, left: 22, top: 21.50, position: 'absolute', overflow: 'hidden'}}>
        <div style={{width: 18, height: 18, left: 3, top: 3, position: 'absolute', background: '#0075FF'}} />
      </div>
    </div>
  );
};

