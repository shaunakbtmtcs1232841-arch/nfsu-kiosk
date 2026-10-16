import { useEffect, useRef } from 'react';
import { api } from '../api/index.js';
import { playScanBeep } from '../utils/audio.js';

/**
 * Hook for hardware keyboard wedge barcode/RFID scanners & SSE simulated tag events.
 * Scanners send fast keystrokes (< 50ms between keys) terminated by 'Enter'.
 *
 * @param {Function} onScan - Callback when a valid scan is captured: (barcode, source) => void
 * @param {boolean} enabled - Whether scanner listening is currently active
 */
export function useScanner(onScan, enabled = true) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e) {
      // Don't intercept if user is typing in an active text input or textarea
      const target = e.target;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (isInput) return;

      const now = performance.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter key marks end of scan sequence
      if (e.key === 'Enter') {
        const scanned = bufferRef.current.trim();
        bufferRef.current = '';

        if (scanned.length >= 4) {
          e.preventDefault();
          playScanBeep();
          onScanRef.current?.(scanned, 'scanner');
        }
        return;
      }

      // Printable single characters
      if (e.key.length === 1) {
        // If the gap between characters is greater than 60ms, this is human typing — reset buffer
        if (bufferRef.current.length > 0 && timeDiff > 60) {
          bufferRef.current = e.key;
        } else {
          bufferRef.current += e.key;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);

    // Also listen for hardware/server SSE events ("card", "rfid_tag")
    const unsubscribe = api.subscribeEvents((event) => {
      if (!event) return;
      if (event.type === 'card' && event.identifier) {
        playScanBeep();
        onScanRef.current?.(event.identifier, 'card');
      } else if (event.type === 'rfid_tag' && (event.barcode || event.tag)) {
        playScanBeep();
        onScanRef.current?.(event.barcode || event.tag, 'rfid');
      }
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      unsubscribe?.();
    };
  }, [enabled]);
}
