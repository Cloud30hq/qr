
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeData } from '../types';
import { DEFAULT_STYLE, Icons } from '../constants';

interface QREditorProps {
  initialData?: QRCodeData | null;
  onSave: (data: QRCodeData) => void;
  onClose: () => void;
}

const QREditor: React.FC<QREditorProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<QRCodeData>>(
    initialData || {
      title: '',
      slug: '',
      targetUrl: '',
      style: { ...DEFAULT_STYLE }
    }
  );
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const makeSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);

  const handleGenerateSlug = async () => {
    if (!formData.title) return;
    setIsGeneratingSlug(true);
    const suggestedSlug = makeSlug(formData.title);
    setFormData(prev => ({ ...prev, slug: suggestedSlug }));
    setIsGeneratingSlug(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.targetUrl) return;

    const finalData: QRCodeData = {
      id: initialData?.id || crypto.randomUUID(),
      title: formData.title || '',
      slug: formData.slug || '',
      targetUrl: formData.targetUrl || '',
      createdAt: initialData?.createdAt || Date.now(),
      scanCount: initialData?.scanCount || 0,
      lastScanned: initialData?.lastScanned,
      style: formData.style || DEFAULT_STYLE
    };

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        {/* Left: Preview */}
        <div className="w-full md:w-1/3 bg-gray-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 mb-4">
            <QRCodeSVG
              value={formData.targetUrl || "https://example.com"}
              size={200}
              fgColor={formData.style?.fgColor}
              bgColor={formData.style?.bgColor}
              level={formData.style?.level}
              includeMargin={formData.style?.includeMargin}
            />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900">{formData.title || "Untitled Code"}</h4>
            <p className="text-sm text-gray-500 truncate">/{formData.slug || "your-slug"}</p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-grow p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit QR Code' : 'New Dynamic QR'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Code Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Marketing Campaign 2024"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Unique Slug</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') }))}
                    placeholder="my-link"
                    className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    disabled={isGeneratingSlug || !formData.title}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    title="Suggest slug with AI"
                  >
                    {isGeneratingSlug ? '...' : 'AI'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Destination URL</label>
              <input
                required
                type="url"
                value={formData.targetUrl}
                onChange={e => setFormData(p => ({ ...p, targetUrl: e.target.value }))}
                placeholder="https://yourwebsite.com/destination"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-500">This is where users will go when they scan. You can change this anytime!</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Style & Design</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Foreground</label>
                  <input
                    type="color"
                    value={formData.style?.fgColor}
                    onChange={e => setFormData(p => ({ ...p, style: { ...p.style!, fgColor: e.target.value } }))}
                    className="w-full h-10 rounded-lg cursor-pointer border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Background</label>
                  <input
                    type="color"
                    value={formData.style?.bgColor}
                    onChange={e => setFormData(p => ({ ...p, style: { ...p.style!, bgColor: e.target.value } }))}
                    className="w-full h-10 rounded-lg cursor-pointer border-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Error Correction</label>
                  <select
                    value={formData.style?.level}
                    onChange={e => setFormData(p => ({ ...p, style: { ...p.style!, level: e.target.value as any } }))}
                    className="w-full px-2 py-2 rounded-lg border border-gray-300 text-sm"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Options</label>
                  <div className="flex items-center h-10">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.style?.includeMargin}
                        onChange={e => setFormData(p => ({ ...p, style: { ...p.style!, includeMargin: e.target.checked } }))}
                        className="rounded text-blue-600"
                      />
                      Margin
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                {initialData ? 'Update Code' : 'Create Dynamic Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QREditor;
