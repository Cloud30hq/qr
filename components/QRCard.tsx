
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeData } from '../types';
import { Icons } from '../constants';

interface QRCardProps {
  code: QRCodeData;
  onDelete: (id: string) => void;
  onEdit: (code: QRCodeData) => void;
}

const QRCard: React.FC<QRCardProps> = ({ code, onDelete, onEdit }) => {
  const [copied, setCopied] = useState(false);
  
  // Construct the redirect URL (assumes app is hosted and using HashRouter)
  const redirectUrl = `${window.location.origin}${window.location.pathname}#/r/${code.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById(`qr-svg-${code.id}`);
    if (!svg) return;
    const size = code.style.size;
    const svgClone = svg.cloneNode(true) as SVGElement;
    svgClone.setAttribute("width", `${size}`);
    svgClone.setAttribute("height", `${size}`);
    if (!svgClone.getAttribute("viewBox")) {
      svgClone.setAttribute("viewBox", `0 0 ${size} ${size}`);
    }
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0, size, size);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${code.slug}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex gap-4">
        <div className="flex-shrink-0 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <QRCodeSVG
            id={`qr-svg-${code.id}`}
            value={redirectUrl}
            size={100}
            fgColor={code.style.fgColor}
            bgColor={code.style.bgColor}
            level={code.style.level}
            includeMargin={code.style.includeMargin}
          />
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">{code.title}</h3>
            <div className="flex gap-1">
              <button 
                onClick={() => onEdit(code)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Icons.Edit />
              </button>
              <button 
                onClick={() => onDelete(code.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
          
          <div className="text-xs font-mono text-gray-400 mb-2 truncate">
            /{code.slug}
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
               <Icons.Chart />
               <span className="font-medium">{code.scanCount}</span>
               <span className="text-gray-400 text-xs">scans</span>
            </div>
            {code.lastScanned && (
              <div className="text-xs text-gray-400 italic">
                Last: {new Date(code.lastScanned).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex gap-2">
        <button 
          onClick={handleCopy}
          className="flex-1 text-xs font-medium py-1.5 px-3 rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button 
          onClick={handleDownload}
          className="flex-1 text-xs font-medium py-1.5 px-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Download PNG
        </button>
      </div>
    </div>
  );
};

export default QRCard;
