import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Image, Trash2, Eye, X, RefreshCw, Filter } from 'lucide-react';
import axios from 'axios';
import { cn } from '../../lib/utils';

interface GameImage {
  id: string;
  category: string;
  keyword: string;
  url: string;
  thumbnail: string;
  tags: string[];
  usageCount: number;
  lastUsedAt: string | null;
  isActive: boolean;
}

const CATEGORIES = [
  'flag', 'logo', 'film', 'landmark', 'person', 'animal',
  'instrument', 'artwork', 'food', 'nature', 'architecture', 'map',
];

const CATEGORY_LABELS: Record<string, string> = {
  flag: 'Bayraklar', logo: 'Logolar', film: 'Filmler',
  landmark: 'Yer Isaretleri', person: 'Kisiler', animal: 'Hayvanlar',
  instrument: 'Enstrumanlar', artwork: 'Sanat Eserleri', food: 'Yemekler',
  nature: 'Doga', architecture: 'Mimari', map: 'Haritalar',
};

const CATEGORY_ICONS: Record<string, string> = {
  flag: '🚩', logo: '🏷️', film: '🎬', landmark: '🏛️',
  person: '👤', animal: '🐾', instrument: '🎵', artwork: '🖼️',
  food: '🍽️', nature: '🌿', architecture: '🏗️', map: '🗺️',
};

const API = '/api/game-images';

export function GameImageManager() {
  const [images, setImages] = useState<GameImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<{ total: number; totalUsageCount: number; categories: Record<string, number> } | null>(null);
  const [preview, setPreview] = useState<GameImage | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('q', search);
      params.set('page', String(page));
      params.set('limit', '50');
      const { data } = await axios.get(`${API}/search?${params}`);
      setImages(data.items);
      setTotalPages(data.totalPages);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/stats`);
      setStats(data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchImages(); }, [category, page]);
  useEffect(() => { fetchStats(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      fetchStats();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-4">
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-text-muted">Toplam Gorsel</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalUsageCount}</p>
            <p className="text-xs text-text-muted">Kullanim Sayisi</p>
          </div>
          <div className="glass col-span-2 rounded-2xl p-4">
            <div className="flex flex-wrap gap-1.5">
              {stats.categories && Object.entries(stats.categories).map(([cat, count]) => (
                <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {CATEGORY_ICONS[cat] ?? '📁'} {count}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchImages()}
            placeholder="Gorsel ara..." className="w-full rounded-xl border border-border bg-surface-2 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-primary" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setCategory(''); setPage(1); }}
          className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-all', !category ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:border-primary/50')}>
          <Filter size={12} className="inline mr-1" /> Tumu
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-all', category === cat ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:border-primary/50')}>
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            {stats?.categories[cat] && <span className="ml-1 rounded-full bg-white/10 px-1.5 text-[10px]">{stats.categories[cat]}</span>}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="flex items-center justify-center py-20"><RefreshCw size={32} className="animate-spin text-primary" /></motion.div>
        ) : images.length === 0 ? (
          <motion.div key="empty" className="flex flex-col items-center gap-4 py-20 text-text-muted"><Image size={48} /><p>Gorsel bulunamadi</p></motion.div>
        ) : (
          <motion.div key="grid" className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {images.map((img) => (
              <motion.div key={img.id} layout className="group relative overflow-hidden rounded-xl border border-border/50 bg-surface-1"
                onClick={() => setPreview(img)}>
                <div className="aspect-square overflow-hidden">
                  <img src={img.thumbnail || img.url} alt={img.keyword} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-medium text-white">{img.keyword}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }} className="rounded-md p-1 text-text-muted opacity-0 transition-all hover:bg-wrong/20 hover:text-wrong group-hover:opacity-100"><Trash2 size={12} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all', page === p ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted hover:bg-surface-2/80')}>{p}</button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-surface-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setPreview(null)} className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"><X size={16} /></button>
              <img src={preview.url} alt={preview.keyword} className="max-h-[70vh] w-full object-contain" />
              <div className="border-t border-border/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[preview.category]}</span>
                  <span className="font-semibold text-white">{preview.keyword}</span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{CATEGORY_LABELS[preview.category]}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {preview.tags.map((tag) => (<span key={tag} className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-text-muted">#{tag}</span>))}
                </div>
                <p className="mt-2 truncate text-xs text-text-muted"><Eye size={12} className="inline mr-1" />{preview.url}</p>
                <p className="text-xs text-text-muted">Kullanim: {preview.usageCount} kez{preview.lastUsedAt && ` - Son: ${new Date(preview.lastUsedAt).toLocaleDateString('tr-TR')}`}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}