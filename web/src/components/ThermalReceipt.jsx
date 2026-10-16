import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatSipDate, formatTime, formatDate } from '../utils/format.js';

export function ThermalReceipt({
  patron,
  checkouts = [],
  checkins = [],
  renewals = [],
  sessionEndTime = new Date(),
}) {
  const [qrUrl, setQrUrl] = useState('');

  const totalTxnCount = checkouts.length + checkins.length + renewals.length;

  useEffect(() => {
    // Generate QR code with plain-text summary
    const summaryLines = [
      'NFSU LIBRARY RECEIPT',
      `Date: ${formatDate(sessionEndTime)} ${formatTime(sessionEndTime)}`,
      `Patron: ${patron?.maskedId || 'GUEST'}`,
      `Total Txns: ${totalTxnCount}`,
      ...checkouts.map((c) => `OUT: ${c.barcode} (Due: ${formatSipDate(c.dueDate)})`),
      ...checkins.map((c) => `IN: ${c.barcode}`),
      ...renewals.map((r) => `RNW: ${r.barcode} (Due: ${formatSipDate(r.dueDate)})`),
      'Verify: https://nfsu.ac.in/library',
    ];

    QRCode.toDataURL(summaryLines.join('\n'), { width: 180, margin: 1 })
      .then(setQrUrl)
      .catch((err) => console.error('QR generation error:', err));
  }, [patron, checkouts, checkins, renewals, sessionEndTime, totalTxnCount]);

  return (
    <>
      {/* 80mm POS Thermal Receipt element formatted for window.print() */}
      <div id="thermal-receipt" className="hidden font-mono text-black">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
            NATIONAL FORENSIC SCIENCES UNIVERSITY
          </div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            Central Library Services
          </div>
          <div style={{ fontSize: '10px' }}>Gandhinagar Campus, Gujarat</div>
          <div style={{ margin: '4px 0', borderBottom: '1px dashed #000' }}></div>
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
            SELF-CHECK CIRCULATION RECEIPT
          </div>
          <div style={{ margin: '4px 0', borderBottom: '1px dashed #000' }}></div>
        </div>

        <div style={{ fontSize: '10px', marginBottom: '6px' }}>
          <div>Date: {formatDate(sessionEndTime)} {formatTime(sessionEndTime)}</div>
          <div>Patron ID: {patron?.maskedId || 'ANONYMOUS'}</div>
          <div>Name: {patron?.displayName || 'Library Member'}</div>
          <div>Koha SIP2 Terminal: KIOSK-01</div>
        </div>

        <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }}></div>

        {/* Issued Items */}
        {checkouts.length > 0 && (
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
              ITEMS ISSUED / BORROWED ({checkouts.length}):
            </div>
            {checkouts.map((item, idx) => (
              <div key={idx} style={{ marginTop: '3px' }}>
                <div style={{ fontWeight: 'bold' }}>{idx + 1}. {item.title || item.barcode}</div>
                <div>   Barcode: {item.barcode}</div>
                <div style={{ fontWeight: 'bold' }}>   DUE: {formatSipDate(item.dueDate)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Returned Items */}
        {checkins.length > 0 && (
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
              ITEMS RETURNED ({checkins.length}):
            </div>
            {checkins.map((item, idx) => (
              <div key={idx} style={{ marginTop: '3px' }}>
                <div>{idx + 1}. {item.title || item.barcode}</div>
                <div>   Barcode: {item.barcode}</div>
                <div>   Status: RETURNED ✓ ({item.sortBin || 'Standard Shelves'})</div>
              </div>
            ))}
          </div>
        )}

        {/* Renewed Items */}
        {renewals.length > 0 && (
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
              ITEMS RENEWED ({renewals.length}):
            </div>
            {renewals.map((item, idx) => (
              <div key={idx} style={{ marginTop: '3px' }}>
                <div>{idx + 1}. {item.title || item.barcode}</div>
                <div>   Barcode: {item.barcode}</div>
                <div>   NEW DUE: {formatSipDate(item.dueDate)}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }}></div>

        <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '6px' }}>
          <div>Total Transactions: {totalTxnCount}</div>
          <div>Outstanding Account Fines: {patron?.feeAmount || '₹ 0.00'}</div>
          {qrUrl && (
            <div style={{ margin: '8px auto', display: 'flex', justifyContent: 'center' }}>
              <img src={qrUrl} alt="Receipt QR" style={{ width: '100px', height: '100px' }} />
            </div>
          )}
          <div style={{ marginTop: '4px', fontSize: '9px' }}>
            Please retain this slip for security gate verification.
          </div>
          <div style={{ marginTop: '2px', fontSize: '9px', fontWeight: 'bold' }}>
            *** NFSU LIBRARY SERVICES ***
          </div>
        </div>
      </div>

      {/* On-Screen Receipt Preview Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-md max-w-md mx-auto text-left relative overflow-hidden font-mono">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-nfsu-gold via-nfsu-navy to-nfsu-gold"></div>
        <div className="text-center pb-4 border-b border-dashed border-slate-300">
          <h3 className="font-serif font-black text-lg text-nfsu-navy uppercase">
            National Forensic Sciences University
          </h3>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Central Library Services • Gandhinagar
          </p>
          <div className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full mt-2">
            Circulation Receipt
          </div>
        </div>

        <div className="py-3 text-xs text-slate-600 border-b border-dashed border-slate-300 space-y-1">
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span className="font-semibold text-slate-900">{formatDate(sessionEndTime)} {formatTime(sessionEndTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Patron ID:</span>
            <span className="font-semibold text-slate-900">{patron?.maskedId || 'GUEST'}</span>
          </div>
          <div className="flex justify-between">
            <span>Name:</span>
            <span className="font-semibold text-slate-900">{patron?.displayName || 'Patron'}</span>
          </div>
        </div>

        <div className="py-3 text-xs space-y-3">
          {checkouts.length > 0 && (
            <div>
              <span className="font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Issued Items ({checkouts.length})
              </span>
              {checkouts.map((item, idx) => (
                <div key={idx} className="bg-emerald-50/70 p-2 rounded border border-emerald-200 mb-1">
                  <div className="font-bold text-slate-800 truncate">{item.title || item.barcode}</div>
                  <div className="flex justify-between text-slate-600 text-[11px] mt-0.5">
                    <span>{item.barcode}</span>
                    <span className="font-bold text-emerald-800">Due: {formatSipDate(item.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {checkins.length > 0 && (
            <div>
              <span className="font-bold text-blue-700 uppercase tracking-wider block mb-1">
                Returned Items ({checkins.length})
              </span>
              {checkins.map((item, idx) => (
                <div key={idx} className="bg-blue-50/70 p-2 rounded border border-blue-200 mb-1">
                  <div className="font-bold text-slate-800 truncate">{item.title || item.barcode}</div>
                  <div className="flex justify-between text-slate-600 text-[11px] mt-0.5">
                    <span>{item.barcode}</span>
                    <span className="font-bold text-blue-800">Returned ✓</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {renewals.length > 0 && (
            <div>
              <span className="font-bold text-purple-700 uppercase tracking-wider block mb-1">
                Renewed Items ({renewals.length})
              </span>
              {renewals.map((item, idx) => (
                <div key={idx} className="bg-purple-50/70 p-2 rounded border border-purple-200 mb-1">
                  <div className="font-bold text-slate-800 truncate">{item.title || item.barcode}</div>
                  <div className="flex justify-between text-slate-600 text-[11px] mt-0.5">
                    <span>{item.barcode}</span>
                    <span className="font-bold text-purple-800">New Due: {formatSipDate(item.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalTxnCount === 0 && (
            <div className="text-center py-4 text-slate-400">
              No new circulation transactions performed in this session.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <div>Total Actions: <span className="font-bold text-slate-900">{totalTxnCount}</span></div>
            <div>Dues: <span className="font-bold text-slate-900">{patron?.feeAmount || '₹ 0.00'}</span></div>
          </div>
          {qrUrl && (
            <div className="text-center">
              <img src={qrUrl} alt="Receipt QR" className="w-16 h-16 border rounded bg-white p-0.5" />
              <span className="text-[9px] text-slate-400 block mt-0.5">QR Slip</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
