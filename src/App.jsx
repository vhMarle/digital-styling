import React, { useState } from 'react';

// Sub-categories for details dropdowns
const DETAIL_OPTIONS = {
  category: ['Tops & Blouses', 'Bottoms & Denim', 'Outerwear & Dusters', 'Dresses & Jumpsuits', 'Footwear'],
  color: ['Cool Neutrals', 'Navy Blue', 'Forest Green', 'Rich Burgundy', 'Sage / Olive Green', 'Rose Pink', 'Chocolate Brown', 'Metallic Silver/Gold'],
  season: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'],
  occasion: ['Casual Everyday', 'Resort & Vacation', 'Work & Professional', 'Evening & Social', 'Outdoor Hiking & Camping']
};

export default function App() {
  const [currentStep, setCurrentStep] = useState('source'); // 'source', 'details', 'wardrobe'
  const [selectedSource, setSelectedSource] = useState(null);
  
  // Form state for item details with dropdown selections
  const [details, setDetails] = useState({
    category: '',
    color: '',
    season: '',
    occasion: '',
    notes: ''
  });

  const handleSourceSelect = (sourceType) => {
    setSelectedSource(sourceType);
    setCurrentStep('details');
  };

  const handleDetailChange = (field, value) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleUndoToSource = () => {
    setCurrentStep('source');
    setSelectedSource(null);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    setCurrentStep('wardrobe');
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-neutral-800/80 backdrop-blur-md border border-neutral-700/50 rounded-2xl p-6 shadow-2xl">
        
        {/* Step 1: Select Source */}
        {currentStep === 'source' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-wide text-rose-200">Catalog New Item</h2>
              <p className="text-sm text-neutral-400 mt-1">Choose how you'd like to add your piece</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleSourceSelect('camera')}
                className="flex flex-col items-center justify-center p-6 bg-neutral-700/40 hover:bg-neutral-700/70 border border-neutral-600/50 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 mb-3 rounded-full bg-rose-900/30 flex items-center justify-center border border-rose-500/30 group-hover:scale-105 transition-transform">
                  📷
                </div>
                <span className="text-sm font-medium text-neutral-200">Take Photo</span>
              </button>

              <button
                onClick={() => handleSourceSelect('upload')}
                className="flex flex-col items-center justify-center p-6 bg-neutral-700/40 hover:bg-neutral-700/70 border border-neutral-600/50 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 mb-3 rounded-full bg-rose-900/30 flex items-center justify-center border border-rose-500/30 group-hover:scale-105 transition-transform">
                  📂
                </div>
                <span className="text-sm font-medium text-neutral-200">Upload Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details Form with Sub-categories & Sizing/Move built in implicitly */}
        {currentStep === 'details' && (
          <form onSubmit={handleSaveItem} className="space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <div className="flex items-center space-x-2">
                {/* Replaced button with custom undo-arrow-icon.png */}
                <button
                  type="button"
                  onClick={handleUndoToSource}
                  title="Reselect Source"
                  className="p-1.5 hover:bg-neutral-700/50 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <img 
                    src="/undo-arrow-icon.png" 
                    alt="Back to Source" 
                    className="w-6 h-6 object-contain filter brightness-125"
                  />
                  <span className="text-xs font-medium text-rose-300">Back</span>
                </button>
                <h3 className="text-lg font-medium text-rose-200">Item Details</h3>
              </div>
              <span className="text-xs text-neutral-400 capitalize bg-neutral-700/50 px-2.5 py-1 rounded-full border border-neutral-600">
                Source: {selectedSource}
              </span>
            </div>

            {/* Dropdowns with Sub-categories */}
            <div className="space-y-4">
              {Object.keys(DETAIL_OPTIONS).map((field) => (
                <div key={field} className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-neutral-300">
                    {field}
                  </label>
                  <select
                    value={details[field]}
                    onChange={(e) => handleDetailChange(field, e.target.value)}
                    required
                    className="w-full bg-neutral-900/70 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-rose-400 transition-colors"
                  >
                    <option value="" disabled>Select {field}...</option>
                    {DETAIL_OPTIONS[field].map((subOption) => (
                      <option key={subOption} value={subOption}>
                        {subOption}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-neutral-300">
                  Notes / Styling Cues
                </label>
                <input
                  type="text"
                  placeholder="e.g., pairs well with straight-leg denim"
                  value={details.notes}
                  onChange={(e) => handleDetailChange('notes', e.target.value)}
                  className="w-full bg-neutral-900/70 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-rose-900/60 hover:bg-rose-900/80 border border-rose-500/40 rounded-xl font-medium text-rose-100 transition-all shadow-lg"
            >
              Save to Wardrobe
            </button>
          </form>
        )}

        {/* Step 3: Confirmation / Wardrobe View */}
        {currentStep === 'wardrobe' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-900/30 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-2xl">
              ✓
            </div>
            <h3 className="text-xl font-semibold text-neutral-100">Item Added Successfully!</h3>
            <p className="text-sm text-neutral-400">Your item has been cataloged with your custom specifications.</p>
            <button
              onClick={handleUndoToSource}
              className="mt-4 px-6 py-2.5 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 rounded-xl text-sm font-medium transition-colors"
            >
              Add Another Item
            </button>
          </div>
        )}

      </div>
    </div>
  );
}