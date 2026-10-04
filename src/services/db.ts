import { Movie, LiveChannel, UserProfile, WatchHistoryItem } from '../types';
import heroBackdropImg from '../assets/images/z1_hero_backdrop_1791094781001.jpg';
import scifiPosterImg from '../assets/images/z1_poster_scifi_1791094804248.jpg';

const DB_NAME = 'Z1_MOVIES_STORAGE_DB';
const DB_VERSION = 1;
const VIDEO_STORE_NAME = 'video_blobs';

// IndexedDB helper for permanent offline & uploaded video file storage
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(VIDEO_STORE_NAME)) {
        db.createObjectStore(VIDEO_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeVideoBlob(id: string, blob: Blob): Promise<string> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
      const store = tx.objectStore(VIDEO_STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => {
        // Return a stable synthetic scheme reference
        resolve(`idb://video/${id}`);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to store in IndexedDB:', err);
    throw err;
  }
}

export async function getVideoBlobUrl(idbUri: string): Promise<string | null> {
  if (!idbUri.startsWith('idb://video/')) {
    return idbUri;
  }
  const id = idbUri.replace('idb://video/', '');
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE_NAME, 'readonly');
      const store = tx.objectStore(VIDEO_STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const result = req.result;
        if (result instanceof Blob) {
          const url = URL.createObjectURL(result);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to load blob from IndexedDB:', err);
    return null;
  }
}

export async function deleteVideoBlob(idbUri: string): Promise<void> {
  if (!idbUri.startsWith('idb://video/')) return;
  const id = idbUri.replace('idb://video/', '');
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
    tx.objectStore(VIDEO_STORE_NAME).delete(id);
  } catch (e) {
    console.warn('Failed to delete video blob from idb', e);
  }
}

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'z1-chrono-protocol',
    title: 'Chrono Protocol: Redline',
    description: 'In a dystopian metropolis ruled by autonomous algorithmic syndicates, a rogue security operative discovers a classified temporal relay device capable of rewriting 48 seconds of tactical history.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    backdropUrl: heroBackdropImg,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    year: 2026,
    language: 'English',
    genre: ['Action', 'Sci-Fi', 'Cyberpunk'],
    duration: '2h 12m',
    rating: 9.3,
    cast: ['Marcus Kane', 'Elena Vance', 'Tetsuo Sato', 'Nia Rodriguez'],
    director: 'Denis Villeneuve-Grave',
    isTrending: true,
    isFeatured: true,
    isNewRelease: true,
    isTop10: true,
    top10Rank: 1,
    isPremium: true,
    isPublished: true,
    createdAt: '2026-03-15T08:00:00Z',
    views: 482910,
  },
  {
    id: 'z1-horizon-deep',
    title: 'Horizon Deep',
    description: 'When humanity receives a solitary mathematical distress signal from the outer atmospheric rings of Saturn, the crew of the exploratory vessel Aethelgard embarks on an unforgiving voyage into the silent void.',
    posterUrl: scifiPosterImg,
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    year: 2025,
    language: 'English',
    genre: ['Sci-Fi', 'Adventure', 'Mystery'],
    duration: '2h 38m',
    rating: 9.1,
    cast: ['Astrid Lind', 'Cillian Sterling', 'Ken Watanabe-Jones', 'Amara Bell'],
    director: 'Christopher N. Price',
    isTrending: true,
    isFeatured: true,
    isNewRelease: false,
    isTop10: true,
    top10Rank: 2,
    isPremium: false,
    isPublished: true,
    createdAt: '2025-11-20T10:00:00Z',
    views: 890420,
  },
  {
    id: 'z1-silent-district',
    title: 'Silent District',
    description: 'An elite forensic investigator in Tokyo uncovers a series of silent, untraceable disappearances linked to a biometric shadow corporation hidden deep within the Shinjuku neon subterranean.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    year: 2026,
    language: 'Japanese',
    genre: ['Crime', 'Thriller', 'Noir'],
    duration: '1h 56m',
    rating: 8.9,
    cast: ['Kenji Sato', 'Rin Takahashi', 'Hidetoshi Mori'],
    director: 'Takashi Shiraishi',
    isTrending: true,
    isFeatured: false,
    isNewRelease: true,
    isTop10: true,
    top10Rank: 3,
    isPremium: false,
    isPublished: true,
    createdAt: '2026-02-10T12:00:00Z',
    views: 312000,
  },
  {
    id: 'z1-shadow-protocol',
    title: 'Shadow Protocol: Blackout',
    description: 'An undercover intelligence operative is disavowed after a global satellite blackout plunges European capitals into total darkness and state-level cyber confusion.',
    posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    year: 2025,
    language: 'English',
    genre: ['Action', 'Thriller', 'Mystery'],
    duration: '2h 05m',
    rating: 8.7,
    cast: ['Julian Cross', 'Vera Stone', 'Dmitri Rostov'],
    director: 'Katherine Sterling',
    isTrending: true,
    isFeatured: false,
    isNewRelease: false,
    isTop10: true,
    top10Rank: 4,
    isPremium: true,
    isPublished: true,
    createdAt: '2025-08-14T09:00:00Z',
    views: 654000,
  },
  {
    id: 'z1-apex-predator',
    title: 'Apex: The Frozen Ridge',
    description: 'High in the Himalayas, a survival specialist and an orphaned snow leopard form an unlikely bond while escaping a squad of international mercenaries hunting ancient genetic fossils.',
    posterUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    year: 2025,
    language: 'Hindi',
    genre: ['Adventure', 'Drama', 'Action'],
    duration: '2h 24m',
    rating: 8.8,
    cast: ['Ranveer Kapoor', 'Tara Deshmukh', 'Manoj Bajrang'],
    director: 'Vikramaditya Roy',
    isTrending: false,
    isFeatured: false,
    isNewRelease: true,
    isTop10: true,
    top10Rank: 5,
    isPremium: false,
    isPublished: true,
    createdAt: '2026-01-05T14:00:00Z',
    views: 421000,
  },
  {
    id: 'z1-neon-overdrive',
    title: 'Neon Overdrive',
    description: 'Illegal night racers tune prototype electromagnetic supercars through subterranean transport tubes beneath Neo-Seoul, racing for the ultimate freedom code.',
    posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    year: 2026,
    language: 'Korean',
    genre: ['Action', 'Sci-Fi'],
    duration: '1h 48m',
    rating: 8.5,
    cast: ['Park Ji-Hoon', 'Bae Suzy-Lin', 'Lee Dong-Wook'],
    director: 'Kim Jee-Woon',
    isTrending: true,
    isFeatured: false,
    isNewRelease: true,
    isTop10: true,
    top10Rank: 6,
    isPremium: true,
    isPublished: true,
    createdAt: '2026-03-01T15:30:00Z',
    views: 395000,
  },
  {
    id: 'z1-valkyrie-fury',
    title: 'Valkyrie: Cold Dawn',
    description: 'A retired Nordic pilot is pulled back into action when an experimental stealth orbital carrier crashes in an Arctic archipelago during a severe geomagnetic storm.',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    year: 2024,
    language: 'English',
    genre: ['Action', 'Thriller'],
    duration: '2h 02m',
    rating: 8.4,
    cast: ['Freja Mikkelsen', 'Lars Eidinger', 'Hanna Alström'],
    director: 'Morten Tyldum',
    isTrending: false,
    isFeatured: false,
    isNewRelease: false,
    isTop10: true,
    top10Rank: 7,
    isPremium: false,
    isPublished: true,
    createdAt: '2024-10-18T10:00:00Z',
    views: 298000,
  },
  {
    id: 'z1-blood-crimson',
    title: 'Crimson Eclipse',
    description: 'An ancient clan of shadow guardians in medieval Spain faces an existential threat when an otherworldly comet shatters their protective seal.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    year: 2025,
    language: 'Spanish',
    genre: ['Fantasy', 'Action', 'Horror'],
    duration: '2h 15m',
    rating: 8.6,
    cast: ['Javier Morales', 'Sofia De La Cruz', 'Antonio Banderas-Vidal'],
    director: 'Guillermo Del Mar',
    isTrending: true,
    isFeatured: false,
    isNewRelease: false,
    isTop10: true,
    top10Rank: 8,
    isPremium: false,
    isPublished: true,
    createdAt: '2025-06-22T11:00:00Z',
    views: 450000,
  },
  {
    id: 'z1-le-voyageur',
    title: 'Le Mirage de Paris',
    description: 'A brilliant illusionist in 1920s Montmartre creates a stage apparatus that accidentally punctures the boundary between dreams and reality.',
    posterUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    year: 2025,
    language: 'French',
    genre: ['Drama', 'Mystery', 'Fantasy'],
    duration: '2h 08m',
    rating: 8.7,
    cast: ['Camille Laurent', 'Louis Garrel-Piaf', 'Marion Cotillard-Rive'],
    director: 'Jean-Pierre Jeunet-Noir',
    isTrending: false,
    isFeatured: false,
    isNewRelease: false,
    isTop10: true,
    top10Rank: 9,
    isPremium: true,
    isPublished: true,
    createdAt: '2025-04-10T16:00:00Z',
    views: 310000,
  },
  {
    id: 'z1-infinity-core',
    title: 'Infinity Core',
    description: 'A team of oceanographers diving 11,000 meters into the Mariana Trench encounters a biomechanical spire radiating infinite clean fusion energy.',
    posterUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    year: 2026,
    language: 'English',
    genre: ['Sci-Fi', 'Thriller'],
    duration: '2h 19m',
    rating: 9.0,
    cast: ['Liam Sterling', 'Sienna Brooks', 'Hassan Al-Zaid'],
    director: 'James Cameron-Scott',
    isTrending: true,
    isFeatured: false,
    isNewRelease: true,
    isTop10: true,
    top10Rank: 10,
    isPremium: true,
    isPublished: true,
    createdAt: '2026-02-28T18:00:00Z',
    views: 520000,
  },
  {
    id: 'z1-comedy-blitz',
    title: 'Double Trouble Bangkok',
    description: 'Two estranged twin brothers—one a cautious accountant, the other a reckless stunt coordinator—must pose as each other to survive a hilarious international misunderstanding in Thailand.',
    posterUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    year: 2025,
    language: 'English',
    genre: ['Comedy', 'Action'],
    duration: '1h 42m',
    rating: 8.1,
    cast: ['Samson Chen', 'Tyler Vance', 'Mei Ling'],
    director: 'Paul Feig-Tan',
    isTrending: false,
    isFeatured: false,
    isNewRelease: false,
    isTop10: false,
    isPremium: false,
    isPublished: true,
    createdAt: '2025-05-12T08:00:00Z',
    views: 180000,
  },
  {
    id: 'z1-ascent-everest',
    title: 'The Unforgiven Peak',
    description: 'During the most devastating Himalayan blizzard in modern history, three mountain rescue guides race against hypothermia to save an isolated research expedition.',
    posterUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1400&auto=format&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    year: 2025,
    language: 'English',
    genre: ['Adventure', 'Drama', 'Thriller'],
    duration: '2h 11m',
    rating: 8.6,
    cast: ['Christian Bale-Hart', 'Elizabeth Olsen-Ray', 'Tenzing Norgay Jr.'],
    director: 'Baltasar Kormákur',
    isTrending: false,
    isFeatured: false,
    isNewRelease: false,
    isTop10: false,
    isPremium: false,
    isPublished: true,
    createdAt: '2025-07-19T13:00:00Z',
    views: 245000,
  }
];

export const INITIAL_LIVE_CHANNELS: LiveChannel[] = [
  {
    id: 'z1-cinema-hd',
    name: 'Z1 Cinema HD',
    logo: '🎬',
    category: 'Cinema',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    currentProgram: 'Blockbuster Premiere: Cyber Surge',
    nextProgram: 'Neon Nights Feature Film',
    viewersCount: 42100,
  },
  {
    id: 'z1-action-247',
    name: 'Z1 Action 24/7',
    logo: '🔥',
    category: 'Action',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    currentProgram: 'Non-Stop High Octane Chase',
    nextProgram: 'Special Ops: Extraction',
    viewersCount: 28450,
  },
  {
    id: 'z1-scifi-universe',
    name: 'Z1 Sci-Fi & Beyond',
    logo: '🪐',
    category: 'Sci-Fi',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    currentProgram: 'Deep Cosmos: Episode 4',
    nextProgram: 'Interstellar Horizons Live',
    viewersCount: 19800,
  },
  {
    id: 'z1-classic-noir',
    name: 'Z1 World Premiere',
    logo: '💎',
    category: 'World',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    currentProgram: 'Tokyo Midnight Chronicles',
    nextProgram: 'Cannes Showcase: Le Voyage',
    viewersCount: 14200,
  }
];

export const INITIAL_PROFILE: UserProfile = {
  id: 'user-z1-vip',
  name: 'Alex Hunter',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  isKid: false,
  isVip: true,
  email: 'alex.vip@z1movies.app'
};

const STORAGE_KEYS = {
  MOVIES: 'z1_movies_catalog_v2',
  WATCH_HISTORY: 'z1_watch_history_v2',
  MY_LIST: 'z1_my_list_v2',
  PROFILE: 'z1_active_profile_v2',
  SUPABASE_CONFIG: 'z1_supabase_config_v2'
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucket: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return {
    url: '',
    anonKey: '',
    bucket: 'movies'
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
}

// Data store API with LocalStorage backup & real seed
export function getSavedMovies(): Movie[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load movies from storage:', e);
  }
  saveMovies(INITIAL_MOVIES);
  return INITIAL_MOVIES;
}

export function saveMovies(movies: Movie[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
  } catch (e) {
    console.error('Failed to save movies to storage:', e);
  }
}

export function getWatchHistory(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(e);
  }
  // Default seed: user watched some of Chrono Protocol and Horizon Deep
  const seed: WatchHistoryItem[] = [
    {
      movieId: 'z1-chrono-protocol',
      progressPercent: 62,
      lastWatchedPosition: 4920,
      duration: 7920,
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      movieId: 'z1-horizon-deep',
      progressPercent: 28,
      lastWatchedPosition: 2650,
      duration: 9480,
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  saveWatchHistory(seed);
  return seed;
}

export function saveWatchHistory(items: WatchHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(items));
  } catch (e) {
    console.warn(e);
  }
}

export function getMyList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MY_LIST);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(e);
  }
  const defaultList = ['z1-chrono-protocol', 'z1-silent-district', 'z1-infinity-core'];
  saveMyList(defaultList);
  return defaultList;
}

export function saveMyList(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MY_LIST, JSON.stringify(ids));
  } catch (e) {
    console.warn(e);
  }
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_PROFILE;
}

export function saveUserProfile(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn(e);
  }
}
