import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Trees, 
  Dog, 
  ChevronLeft, 
  Palette as PaletteIcon, 
  Sparkles,
  Home,
  Grid
} from 'lucide-react';
import { COLORING_IMAGES, ColoringImage } from './constants';
import { ColoringCanvas } from './components/ColoringCanvas';
import { ColorWheel } from './components/ColorWheel';
import { generateLineArt } from './services/gemini';
import { cn } from './lib/utils';

type View = 'home' | 'gallery' | 'studio';

const CATEGORIES = [
  { id: 'manusia', name: 'Manusia', icon: Users, color: 'bg-orange-400', textColor: 'text-orange-900' },
  { id: 'alam', name: 'Alam', icon: Trees, color: 'bg-emerald-400', textColor: 'text-emerald-900' },
  { id: 'hewan', name: 'Hewan', icon: Dog, color: 'bg-blue-400', textColor: 'text-blue-900' },
] as const;

const PALETTE = [
  '#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93',
  '#FF924C', '#FFD166', '#06D6A0', '#118AB2', '#073B4C',
  '#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0',
  '#FFFFFF', '#000000'
];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]['id'] | null>(null);
  const [selectedImage, setSelectedImage] = useState<ColoringImage | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const [showColorWheel, setShowColorWheel] = useState(false);

  const filteredImages = COLORING_IMAGES.filter(img => img.category === selectedCategory);

  const handleSelectImage = async (img: ColoringImage) => {
    setSelectedImage(img);
    setView('studio');
    setGeneratedUrl(null);
    const url = await generateLineArt(img.prompt);
    setGeneratedUrl(url);
  };

  const handleBack = () => {
    if (view === 'studio') setView('gallery');
    else if (view === 'gallery') setView('home');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-gray-800 font-sans selection:bg-indigo-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {view !== 'home' && (
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={20} />
            Warna-Warni Cilik
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('home')}
            className={cn("p-2 rounded-xl transition-all", view === 'home' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "hover:bg-gray-100")}
          >
            <Home size={20} />
          </button>
          {selectedCategory && (
            <button 
              onClick={() => setView('gallery')}
              className={cn("p-2 rounded-xl transition-all", view === 'gallery' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "hover:bg-gray-100")}
            >
              <Grid size={20} />
            </button>
          )}
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="col-span-full text-center mb-8">
                <h2 className="text-4xl font-black text-gray-900 mb-4">Ayo Mewarnai!</h2>
                <p className="text-gray-500 text-lg">Pilih kategori yang kamu suka</p>
              </div>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setView('gallery');
                  }}
                  className={cn(
                    "group relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-xl transition-all hover:scale-[1.02] active:scale-95",
                    cat.color
                  )}
                >
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-white/30 backdrop-blur-md p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                      <cat.icon size={64} className={cat.textColor} />
                    </div>
                    <h3 className={cn("text-3xl font-black uppercase tracking-wider", cat.textColor)}>
                      {cat.name}
                    </h3>
                    <p className={cn("mt-2 font-medium opacity-80", cat.textColor)}>
                      50 Gambar Seru
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {view === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-900">
                  Koleksi {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </h2>
                <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-bold">
                  {filteredImages.length} Gambar
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectImage(img)}
                    className="group bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-400 text-left"
                  >
                    <div className="aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative">
                      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 z-10">
                        #{idx + 1}
                      </div>
                      <PaletteIcon className="text-gray-200 group-hover:scale-110 transition-transform" size={48} />
                    </div>
                    <h4 className="font-bold text-gray-700 truncate">{img.title}</h4>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'studio' && selectedImage && (
            <motion.div 
              key="studio"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900">{selectedImage.title}</h2>
                <p className="text-gray-500">Ketuk area untuk mewarnai!</p>
              </div>

              {generatedUrl ? (
                <ColoringCanvas 
                  imageUrl={generatedUrl} 
                  selectedColor={activeColor}
                  onColorChange={setActiveColor}
                />
              ) : (
                <div className="w-full max-w-[600px] aspect-square bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-indigo-600 font-bold animate-pulse">Membuat Gambar Ajaib...</p>
                </div>
              )}

              {/* Palette & Color Wheel */}
              <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-6 z-50">
                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                  <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
                    <button 
                      onClick={() => setShowColorWheel(!showColorWheel)}
                      className={cn(
                        "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md",
                        showColorWheel ? "bg-indigo-600 text-white scale-110" : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <PaletteIcon size={28} />
                    </button>
                    <div className="w-px h-10 bg-gray-200 flex-shrink-0" />
                    {PALETTE.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setActiveColor(color);
                          setShowColorWheel(false);
                        }}
                        className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110 active:scale-90 shadow-sm",
                          activeColor === color ? "border-indigo-600 scale-110" : "border-white"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {showColorWheel && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4"
                  >
                    <ColorWheel color={activeColor} onChange={setActiveColor} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      {view === 'home' && (
        <footer className="py-12 text-center text-gray-400 text-sm">
          <p>© 2024 Warna-Warni Cilik • Dibuat dengan ❤️ untuk Anak Indonesia</p>
        </footer>
      )}
    </div>
  );
}
