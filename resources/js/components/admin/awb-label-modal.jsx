import { useEffect, useRef, useState } from "react";
import { X, Download, Package, QrCode } from "lucide-react";
import { toPng } from "html-to-image";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";

const addressLines = (address = {}) => [
  address.address_line1,
  address.address_line2,
  [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
  address.country,
].filter(Boolean);

export function AwbLabelModal({ order, brand, onClose }) {
  const labelRef = useRef(null);
  const barcodeRef = useRef(null);
  const qrRef = useRef(null);
  const [codesReady, setCodesReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!order?.trackingNumber || !barcodeRef.current || !qrRef.current) return undefined;

    let active = true;
    setCodesReady(false);

    try {
      JsBarcode(barcodeRef.current, order.trackingNumber, {
        format: "CODE128",
        displayValue: false,
        height: 58,
        margin: 0,
        width: 2,
        lineColor: "#111827",
        background: "#ffffff",
      });
    } catch {
      toast.error("Could not create the AWB barcode. Check the tracking number.");
      return undefined;
    }

    QRCode.toCanvas(qrRef.current, order.trackingNumber, {
      width: 112,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#111827", light: "#ffffff" },
    }).then(() => {
      if (active) setCodesReady(true);
    }).catch(() => {
      if (active) toast.error("Could not create the AWB QR code.");
    });

    return () => {
      active = false;
    };
  }, [order?.trackingNumber]);

  const downloadLabel = async () => {
    if (!labelRef.current || !codesReady) return;

    setIsDownloading(true);
    try {
      await document.fonts?.ready;
      const image = await toPng(labelRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `awb-${order.id.replace(/[^A-Za-z0-9_-]+/g, "-")}.png`;
      link.href = image;
      link.click();
      toast.success("AWB label downloaded.");
    } catch (error) {
      toast.error("Could not export the AWB label. Check that the store logo is accessible and try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const destinationLines = addressLines(order.shippingAddressData);
  const isCod = order.paymentMethod?.toLowerCase() === "cod";
  const paymentLabel = order.paymentStatus === "Paid"
    ? "PAID"
    : order.paymentStatus === "Refunded"
      ? "REFUNDED"
      : isCod ? `COD • ${formatPrice(order.total)}` : "PAYMENT PENDING";
  const pieces = order.items.reduce((total, item) => total + Number(item.qty || 0), 0);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-[500px] rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">AWB Shipping Label</h2>
            <p className="mt-0.5 text-xs text-slate-500">Order {order.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close AWB label" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-3">
          <div
            ref={labelRef}
            className="mx-auto flex min-h-[630px] w-[420px] max-w-full flex-col bg-white p-5 text-slate-900"
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            <div className="flex items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
              <div className="flex min-w-0 items-center gap-2">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt=""
                    crossOrigin="anonymous"
                    className="max-h-10 max-w-24 object-contain"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="truncate text-sm font-black uppercase tracking-wide">{brand.name}</span>
                )}
              </div>
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Shipping label</span>
            </div>

            <div className="border-b border-dashed border-slate-400 py-3 text-center">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Tracking number / AWB</div>
              <div className="mt-1 break-all font-mono text-lg font-black tracking-wide">{order.trackingNumber}</div>
              <svg ref={barcodeRef} className="mt-2 h-[58px] w-full" aria-label={`Barcode for ${order.trackingNumber}`} />
            </div>

            <div className="grid grid-cols-2 border-b border-slate-300 py-2 text-[10px]">
              <div className="border-r border-slate-300 pr-3">
                <div className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Carrier</div>
                <div className="mt-1 font-extrabold">{order.carrier || "Shipping carrier"}</div>
              </div>
              <div className="pl-3">
                <div className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Order reference</div>
                <div className="mt-1 font-extrabold">{order.id}</div>
              </div>
            </div>

            <div className="flex-1 border-b border-slate-300 py-3">
              <div className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em]">
                <Package className="size-3" /> Ship to
              </div>
              <div className="text-[14px] font-black uppercase leading-tight">{order.customer.name}</div>
              {order.customer.phone && <div className="mt-1 text-[11px] font-bold">{order.customer.phone}</div>}
              <div className="mt-2 space-y-0.5 break-words text-[11px] leading-snug">
                {destinationLines.length > 0
                  ? destinationLines.map((line, index) => <div key={`${index}-${line}`}>{line}</div>)
                  : <div>{order.shippingAddress || "Shipping address not provided"}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-300 py-2.5">
              <div className="border-r border-slate-300 pr-3">
                <div className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Payment / collect</div>
                <div className="mt-1 text-[12px] font-black">{paymentLabel}</div>
              </div>
              <div className="pl-3">
                <div className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Package</div>
                <div className="mt-1 text-[12px] font-black">{pieces} {pieces === 1 ? "item" : "items"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-300 py-3">
              <div className="shrink-0 rounded border border-slate-300 p-1">
                <canvas ref={qrRef} width="112" height="112" className="size-24" aria-label={`QR code for ${order.trackingNumber}`} />
              </div>
              <div className="min-w-0 text-[9px] leading-snug">
                <div className="mb-1 flex items-center gap-1 font-black uppercase tracking-wider">
                  <QrCode className="size-3" /> Scan to read AWB
                </div>
                <div className="break-all font-mono">{order.trackingNumber}</div>
                <div className="mt-2 font-bold">{brand.name}</div>
                {brand.phone && <div>{brand.phone}</div>}
                {brand.email && <div className="break-all">{brand.email}</div>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[8px] font-semibold text-slate-500">
              <span>Order date: {order.date}</span>
              <span>{brand.name}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
            Close
          </button>
          <button
            type="button"
            onClick={downloadLabel}
            disabled={!codesReady || isDownloading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-3.5" />
            {isDownloading ? "Preparing PNG..." : "Download PNG"}
          </button>
        </div>
      </div>
    </div>
  );
}
