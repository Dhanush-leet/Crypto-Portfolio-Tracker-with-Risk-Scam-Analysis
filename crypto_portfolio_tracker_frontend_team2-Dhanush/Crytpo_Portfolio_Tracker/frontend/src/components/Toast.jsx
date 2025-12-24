import React, { useEffect } from 'react';
import '../App.css';

// Very small accessible toast. Parent controls message visibility.
export default function Toast({ message, type = 'info', onClose, duration = 3500 }){
  useEffect(()=>{
    if(!message) return;
    const t = setTimeout(()=> onClose && onClose(), duration);
    return ()=> clearTimeout(t);
  }, [message, duration, onClose]);

  if(!message) return null;
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
