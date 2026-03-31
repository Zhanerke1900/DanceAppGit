import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, CameraOff, CheckCircle2, QrCode, RefreshCcw, XCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ValidatorScanTicketProps {
  events: any[];
  selectedEvent: any | null;
  onSelectEvent: (eventId: string) => void;
  onScan: (qrToken: string, eventId: string) => Promise<any>;
  recentScans: any[];
}

type ScanResultView = {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  title: string;
};

export const ValidatorScanTicket: React.FC<ValidatorScanTicketProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onScan,
  recentScans,
}) => {
  const [qrValue, setQrValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [scannerHint, setScannerHint] = useState('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'validator-ticket-scanner';
  const isHandlingScanRef = useRef(false);

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch {
        // Ignore stop errors during teardown.
      }
      try {
        await scannerRef.current.clear();
      } catch {
        // Ignore clear errors during teardown.
      }
      scannerRef.current = null;
    }
    setIsCameraOpen(false);
    setIsCameraStarting(false);
    isHandlingScanRef.current = false;
  };

  useEffect(() => {
    return () => {
      stopCamera().catch(() => {});
    };
  }, []);

  const runValidation = async (scanValue: string) => {
    if (!selectedEvent?.id || !scanValue.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await onScan(scanValue.trim(), selectedEvent.id);
      setResult(response);
      setQrValue('');
    } catch (error: any) {
      setResult(error?.data || { message: error?.message || 'Scan failed', status: 'invalid' });
    } finally {
      setIsSubmitting(false);
      isHandlingScanRef.current = false;
    }
  };

  const startCamera = async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera scanning is not supported in this browser. You can still paste the QR or barcode value manually.');
      return;
    }
    if (!selectedEvent?.id) {
      setCameraError('Select an event before starting the scanner.');
      return;
    }

    setCameraError('');
    setResult(null);
    setIsCameraStarting(true);
    setIsCameraOpen(true);
    setScannerHint('Starting camera...');

    try {
      await stopCamera();
      setIsCameraOpen(true);

      const scanner = new Html5Qrcode(scannerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
        ],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.7777778,
          disableFlip: false,
        },
        async (decodedText) => {
          if (isHandlingScanRef.current) return;
          isHandlingScanRef.current = true;
          setScannerHint('Code detected. Validating ticket...');
          setQrValue(decodedText);
          await stopCamera();
          await runValidation(decodedText);
        },
        (errorMessage) => {
          if (!isHandlingScanRef.current) {
            setScannerHint(
              errorMessage?.toLowerCase().includes('not found')
                ? 'Looking for a QR code...'
                : 'Scanner is active. Point the camera at a clear QR code.'
            );
          }
        }
      );

      setIsCameraOpen(true);
      setIsCameraStarting(false);
      setScannerHint('Scanner is active. Point the camera at a clear QR code.');
    } catch (error: any) {
      await stopCamera();
      setCameraError(error?.message || 'Unable to access the camera for scanning.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runValidation(qrValue);
  };

  const getResultView = (): ScanResultView | null => {
    if (!result) return null;
    if (result.status === 'validated') {
      return { icon: CheckCircle2, className: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10', title: 'Valid ticket' };
    }
    if (result.status === 'already-used') {
      return { icon: RefreshCcw, className: 'text-amber-300 border-amber-500/20 bg-amber-500/10', title: 'Already used' };
    }
    if (result.status === 'another-event') {
      return { icon: AlertCircle, className: 'text-orange-300 border-orange-500/20 bg-orange-500/10', title: 'Ticket belongs to another event' };
    }
    return { icon: XCircle, className: 'text-red-300 border-red-500/20 bg-red-500/10', title: 'Invalid ticket' };
  };

  const resultView = getResultView();

  return (
    <div className="min-h-screen bg-black p-8">
      <style>{`
        #${scannerElementId} {
          width: 100%;
          height: 100%;
          background: #000;
        }
        #${scannerElementId} > div {
          width: 100%;
          height: 100%;
        }
        #${scannerElementId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border-radius: 0;
        }
        #${scannerElementId}__scan_region {
          border: none !important;
          min-height: 100% !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
        }
        #${scannerElementId}__dashboard {
          display: none !important;
        }
      `}</style>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Scan Ticket</h1>
          <p className="text-gray-400">Select an assigned event, then scan the QR code with the camera or validate a QR or barcode value manually.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Camera Scanner</h2>
                  <p className="text-sm text-gray-400">Use the device camera to scan ticket QR codes.</p>
                </div>
                <div className="flex gap-3">
                  {isCameraOpen ? (
                    <button
                      type="button"
                      onClick={() => stopCamera()}
                      className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-medium text-red-300 transition-colors hover:bg-red-500/20"
                    >
                      <CameraOff className="h-4 w-4" />
                      Stop
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      disabled={isCameraStarting || !selectedEvent?.id}
                      className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Camera className="h-4 w-4" />
                      {isCameraStarting ? 'Starting...' : 'Start Scanner'}
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                <div className="relative aspect-video bg-gray-950">
                  <div id={scannerElementId} className={`h-full w-full ${isCameraOpen ? 'block' : 'hidden'}`} />
                  {!isCameraOpen && (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                      <QrCode className="mb-3 h-10 w-10 text-purple-400" />
                      <p className="font-medium text-white">Scanner is ready</p>
                      <p className="mt-2 max-w-md text-sm text-gray-400">
                        Choose an event, start the camera, and scan a QR code from another screen or printed ticket.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {cameraError && (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {cameraError}
                </div>
              )}
              {!cameraError && scannerHint && (
                <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-200">
                  {scannerHint}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Assigned Event</label>
                  <select
                    value={selectedEvent?.id || ''}
                    onChange={(e) => onSelectEvent(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition-all focus:border-purple-500"
                  >
                    <option value="">Select event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">QR or Barcode Value</label>
                  <textarea
                    value={qrValue}
                    onChange={(e) => setQrValue(e.target.value)}
                    rows={5}
                    placeholder="Paste the QR token or barcode value here"
                    className="w-full resize-none rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition-all focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedEvent?.id || !qrValue.trim() || isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <QrCode className="h-4 w-4" />
                  {isSubmitting ? 'Checking...' : 'Validate Ticket'}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Validation Result</h2>
              {resultView ? (
                <div className={`rounded-2xl border p-5 ${resultView.className}`}>
                  <div className="mb-3 flex items-center gap-2">
                    <resultView.icon className="h-5 w-5" />
                    <span className="text-lg font-semibold">{resultView.title}</span>
                  </div>
                  <p className="text-sm">{result?.message}</p>
                  {result?.ticket?.ticketCode && (
                    <p className="mt-3 text-sm text-white">Ticket: {result.ticket.ticketCode}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">No scans yet in this session.</p>
              )}
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Recent Scans</h2>
              <div className="space-y-3">
                {recentScans.length === 0 ? (
                  <p className="text-gray-400">No recent scans.</p>
                ) : recentScans.map((log) => (
                  <div key={log.id} className="rounded-xl bg-gray-800/40 p-4 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{log.ticketCode || 'Ticket scan'}</p>
                        {log.eventTitle && <p className="mt-1 text-gray-400">{log.eventTitle}</p>}
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium capitalize text-gray-200">
                        {log.result}
                      </span>
                    </div>
                    {log.ticketHolderName && (
                      <p className="mt-3 text-gray-300">
                        Holder: <span className="text-white">{log.ticketHolderName}</span>
                      </p>
                    )}
                    {log.ticketType && (
                      <p className="mt-1 text-gray-400">
                        Ticket type: <span className="text-gray-200">{log.ticketType}</span>
                      </p>
                    )}
                    <p className="mt-2 text-gray-400">{log.message}</p>
                    <p className="mt-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
