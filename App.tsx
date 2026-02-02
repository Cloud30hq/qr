
import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from './services/storageService';
import { QRCodeData } from './types';
import QRCard from './components/QRCard';
import QREditor from './components/QREditor';
import Redirector from './components/Redirector';
import { Icons, APP_NAME } from './constants';

function App() {
  const [codes, setCodes] = useState<QRCodeData[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<QRCodeData | null>(null);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("cloud30qr_admin_token") || ""
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Handle Hash Changes for Routing
  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initial Load
  useEffect(() => {
    let isMounted = true;
    const loadCodes = async () => {
      try {
        const data = await storageService.getCodes();
        if (isMounted) setCodes(data);
      } catch (e) {
        console.error(e);
        setIsAuthOpen(true);
      }
    };
    loadCodes();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (code: QRCodeData) => {
    try {
      if (editingCode) {
        await storageService.updateCode(code.id, code);
      } else {
        await storageService.addCode(code);
      }
      const updated = await storageService.getCodes();
      setCodes(updated);
      setIsEditorOpen(false);
      setEditingCode(null);
    } catch (e) {
      console.error(e);
      setIsAuthOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code? The printed code will no longer redirect users.")) {
      return;
    }
    try {
      await storageService.deleteCode(id);
      const updated = await storageService.getCodes();
      setCodes(updated);
    } catch (e) {
      console.error(e);
      setIsAuthOpen(true);
    }
  };

  const filteredCodes = useMemo(() => {
    return codes.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [codes, searchTerm]);

  // Redirection Route Logic
  if (currentHash.startsWith('#/r/')) {
    const slug = currentHash.replace('#/r/', '');
    return <Redirector slug={slug} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Q</div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                {APP_NAME}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1.5 w-64">
                 <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 <input 
                    type="text" 
                    placeholder="Search codes..." 
                    className="bg-transparent text-sm outline-none w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button 
                onClick={() => {
                  setEditingCode(null);
                  setIsEditorOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-100 transition-all"
               >
                 <Icons.Plus />
                 <span className="hidden sm:inline">New QR</span>
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Dashboard</h1>
          <p className="text-gray-500">Manage your dynamic QR codes and track scan performance.</p>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium mb-1">Total Codes</div>
            <div className="text-3xl font-bold text-gray-900">{codes.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium mb-1">Total Scans</div>
            <div className="text-3xl font-bold text-blue-600">
              {codes.reduce((acc, curr) => acc + curr.scanCount, 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium mb-1">Most Active</div>
            <div className="text-lg font-bold text-gray-900 truncate">
              {codes.length > 0 ? [...codes].sort((a,b) => b.scanCount - a.scanCount)[0].title : "N/A"}
            </div>
          </div>
        </div>

        {/* QR Code Grid */}
        {filteredCodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCodes.map(code => (
              <QRCard 
                key={code.id} 
                code={code} 
                onDelete={handleDelete}
                onEdit={(c) => {
                  setEditingCode(c);
                  setIsEditorOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
               <Icons.Chart />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No QR codes found</h3>
            <p className="text-gray-500 mb-6">Create your first dynamic QR code to get started.</p>
            <button 
              onClick={() => setIsEditorOpen(true)}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
            >
              <Icons.Plus /> Create Now
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} {APP_NAME} - Your Personal QR Shortener.
          </p>
          <div className="mt-2 text-xs text-gray-300 flex justify-center gap-4">
            <span>Dynamic Redirection</span>
            <span>Local Storage Engine</span>
            <span>Professional Analytics</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isEditorOpen && (
        <QREditor 
          initialData={editingCode}
          onSave={handleSave}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingCode(null);
          }}
        />
      )}

      {isAuthOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter your admin token to manage QR codes.
            </p>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Admin token"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  localStorage.setItem("cloud30qr_admin_token", adminToken);
                  setIsAuthOpen(false);
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAuthOpen(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
