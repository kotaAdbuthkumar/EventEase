import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Scan,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Ticket,
  Calendar,
  X,
  Keyboard,
  Camera,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

export default function QRScannerModal({ isOpen, onClose, eventId, onCheckInSuccess }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Initialize camera scanner
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const startScanner = async () => {
        try {
          setCameraError(null);
          const html5QrCode = new Html5Qrcode('qr-reader-container');
          html5QrCodeRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              // Successfully scanned QR Code
              handleVerify(decodedText);
              // Pause scanning briefly to prevent rapid duplicate triggers
              html5QrCode.pause(true);
              setTimeout(() => {
                try {
                  html5QrCode.resume();
                } catch (e) {}
              }, 2500);
            },
            (errorMsg) => {
              // Non-fatal frame scan failure
            }
          );
          setScanning(true);
        } catch (err) {
          console.warn('Camera initiation failed:', err);
          setCameraError('Camera access unavailable or denied. Please use the Manual Input tab.');
          setScanning(false);
        }
      };

      // Slight timeout to let DOM render
      const timeout = setTimeout(startScanner, 100);
      return () => {
        clearTimeout(timeout);
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
            html5QrCodeRef.current.clear();
          });
        }
      };
    }
  }, [isOpen, activeTab]);

  const handleVerify = async (tokenToVerify) => {
    if (!tokenToVerify) return;

    try {
      setVerifying(true);
      const res = await api.post('/tickets/verify', {
        token: tokenToVerify.trim(),
        eventId,
      });

      setScanResult({
        success: true,
        message: res.data.message,
        attendee: res.data.attendee,
      });

      if (onCheckInSuccess) onCheckInSuccess(res.data.attendee);
    } catch (err) {
      const errorData = err.response?.data;
      setScanResult({
        success: false,
        message: errorData?.message || 'Verification failed. Invalid or expired ticket.',
        attendee: errorData?.attendee || null,
        status: errorData?.status || 'ERROR',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleVerify(manualCode.trim());
    }
  };

  const handleClose = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
        html5QrCodeRef.current.clear();
      });
    }
    setScanResult(null);
    setManualCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-indigo-200" />
            <div>
              <h3 className="font-bold text-base">Attendee Check-In Scanner</h3>
              <p className="text-xs text-primary-100">Live ticket authentication and gate check</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={() => {
              setActiveTab('camera');
              setScanResult(null);
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-900'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('manual');
              setScanResult(null);
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-900'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Manual Code / Token Entry</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 space-y-4">
          {activeTab === 'camera' ? (
            <div className="flex flex-col items-center">
              <div
                id="qr-reader-container"
                className="w-full max-w-xs h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 relative flex items-center justify-center"
              >
                {cameraError && (
                  <div className="p-4 text-center text-xs text-rose-300">
                    <p>{cameraError}</p>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold"
                    >
                      Switch to Manual Entry
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Point camera at attendee's digital or printed QR code.
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ticket Token / Attendee ID
                </label>
                <textarea
                  rows={3}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Paste QR Code token or enter Ticket ID..."
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={verifying || !manualCode.trim()}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Database...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-3.5 h-3.5" />
                    <span>Validate Ticket</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Verification Result Banner */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-in slide-in-from-bottom-2 ${
                scanResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <h4 className="text-sm font-bold">
                    {scanResult.success ? 'ENTRY GRANTED' : 'ENTRY REJECTED'}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90">{scanResult.message}</p>

                  {scanResult.attendee && (
                    <div className="mt-3 pt-3 border-t border-current/20 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] opacity-75 block">Attendee</span>
                        <span className="font-bold">{scanResult.attendee.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] opacity-75 block">Tier</span>
                        <span className="font-bold">{scanResult.attendee.ticketType || 'Standard'}</span>
                      </div>
                      {scanResult.attendee.bookingCode && (
                        <div>
                          <span className="text-[10px] opacity-75 block">Booking Reference</span>
                          <span className="font-mono">{scanResult.attendee.bookingCode}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] opacity-75 block">Timestamp</span>
                        <span>{new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setScanResult(null);
                    setManualCode('');
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                >
                  Ready for Next Attendee
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
