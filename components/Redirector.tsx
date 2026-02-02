
import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';

interface RedirectorProps {
  slug: string;
}

const Redirector: React.FC<RedirectorProps> = ({ slug }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeout: number | undefined;
    const resolve = async () => {
      try {
        const target = await storageService.incrementScan(slug);
        if (target) {
          window.location.replace(target);
        } else {
          setError("This QR code link does not exist or has been removed.");
        }
      } catch (e) {
        console.error(e);
        setError("Failed to resolve this QR code. Please try again.");
      }
    };
    resolve();
    return () => {};
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">!</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <a href="#/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="text-xs text-gray-300">Powered by cloud30</div>
    </div>
  );
};

export default Redirector;
