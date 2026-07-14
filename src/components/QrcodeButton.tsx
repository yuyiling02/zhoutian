'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { QrCode, X, Check, Smartphone } from 'lucide-react';

interface QRCodeButtonProps {
  className?: string;
}

export function QRCodeButton({ className }: QRCodeButtonProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <Button
        onClick={() => setShowQR(true)}
        className={`${className} bg-white/20 hover:bg-white/30 text-white font-medium 
          border border-white/20 hover:border-white/40
          hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl
          backdrop-blur-sm`}
      >
        <QrCode className="w-5 h-5 mr-2" />
        扫码查看
      </Button>

      {showQR && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-sm w-full 
              animate-in zoom-in duration-300 border border-white/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-500" />
                扫码访问
              </h3>
              <button 
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 flex justify-center mb-4 border border-gray-100 shadow-inner">
              <QRCodeSVG 
                value={currentUrl}
                size={256}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#1a1a2e"
              />
            </div>

            <p className="text-center text-gray-600 text-sm">
              使用手机扫描二维码即可访问当前页面
            </p>
            
            <div className="mt-3 flex items-center justify-center gap-2">
              <input 
                type="text" 
                value={currentUrl} 
                readOnly
                className="flex-1 text-center text-gray-400 text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentUrl).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }).catch(() => {
                    const textarea = document.createElement('textarea');
                    textarea.value = currentUrl;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300
                  ${copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'}`}
              >
                {copied ? <Check className="w-4 h-4" /> : '复制'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
