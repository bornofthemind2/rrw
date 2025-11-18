import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { 
  BookOpen, 
  User, 
  ShoppingCart, 
  Mail, 
  Menu, 
  X, 
  Award, 
  Calendar, 
  ChevronRight, 
  Star,
  Check,
  Lock,
  LogOut,
  Edit,
  Save,
  Image as ImageIcon,
  ArrowLeft,
  Heart,
  Share2,
  MessageSquare,
  Bell,
  ThumbsUp,
  Trash2,
  Users,
  Mic,
  Play,
  Pause,
  Headphones,
  Plus,
  Activity,
  BarChart3,
  Database,
  Key,
  Shield,
  TrendingUp,
  Globe,
  Copy,
  RefreshCw
} from "lucide-react";

// --- Types ---

interface Book {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription?: string; 
  price: number;
  type: "Hardcover" | "Paperback" | "E-Book";
  image: string;
  isbn?: string;
  pages?: number;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
}

interface Comment {
  id: string;
  bookId: string;
  author: string;
  content: string;
  date: string;
  likes: number;
}

interface Subscriber {
  email: string;
  date: string;
  source: string;
}

interface Podcast {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  audioUrl: string;
  image?: string;
}

interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  last_sign_in: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used: string | null;
}

interface AnalyticsData {
  totalRevenue: number;
  booksSold: number;
  avgOrderValue: number;
  goodreadsRating: number;
  goodreadsReviews: number;
  monthlySales: { month: string; amount: number }[];
}

// --- Mock Data ---

const INITIAL_BOOKS: Book[] = [
  {
    id: "b1",
    title: "Echoes of the Front",
    subtitle: "A Soldier's Memoir",
    description: "A raw and unflinching look at life on the front lines, detailing the brotherhood formed in the crucible of combat and the long journey home.",
    longDescription: "In this harrowing yet deeply human memoir, Robert Ross Williams takes readers into the trenches of modern warfare. 'Echoes of the Front' is not just a recounting of battles won and lost, but a psychological exploration of what it means to serve. From the sweltering heat of desert patrols to the quiet, haunting moments of returning to civilian life, Williams captures the essence of the soldier's experience with poetic grit.",
    price: 24.99,
    type: "Hardcover",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    isbn: "978-3-16-148410-0",
    pages: 342
  },
  {
    id: "b2",
    title: "The Silent Watch",
    subtitle: "Reflections on Freedom",
    description: "An anthology of essays and stories exploring the cost of freedom and the silent burdens carried by those who serve.",
    longDescription: "Freedom is never free. 'The Silent Watch' compiles a decade of essays, short stories, and letters written by Williams during and after his service. It challenges the reader to look beyond the flags and parades to understand the silent, enduring vigil kept by veterans and their families. A critical read for anyone wishing to understand the true cost of liberty.",
    price: 16.50,
    type: "Paperback",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    isbn: "978-1-40-289462-6",
    pages: 215
  },
  {
    id: "b3",
    title: "Brothers in Arms",
    subtitle: "Fiction Based on True Events",
    description: "A gripping novel that weaves together the lives of a platoon separated by time but united by their shared history.",
    longDescription: "Blurring the lines between fact and fiction, 'Brothers in Arms' follows the Alpha Platoon through a deployment that changes them forever. When a training exercise goes wrong, secrets from the past resurface, testing the bonds of brotherhood. Williams brings his technical expertise and emotional depth to a narrative that rivals the best of military fiction.",
    price: 12.99,
    type: "E-Book",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    isbn: "978-0-59-652068-7",
    pages: 408
  }
];

const INITIAL_COMMENTS: Comment[] = [
  { id: "c1", bookId: "b1", author: "James K.", content: "Absolutely riveting. As a vet myself, this hit home.", date: "2023-10-15", likes: 12 },
  { id: "c2", bookId: "b1", author: "Sarah M.", content: "Beautifully written, heartbreaking yet hopeful.", date: "2023-11-02", likes: 8 },
  { id: "c3", bookId: "b2", author: "Editorial Review", content: "A necessary addition to any modern history collection.", date: "2023-09-20", likes: 25 },
];

const INITIAL_PODCASTS: Podcast[] = [
  {
    id: "p1",
    title: "Ep 1: The Weight of the Uniform",
    description: "Robert discusses the transition from military to civilian life and the unseen burdens veterans carry.",
    date: "2024-01-15",
    duration: "45 min",
    audioUrl: "#", 
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "p2",
    title: "Ep 2: Writing as Therapy",
    description: "A conversation on how storytelling can heal trauma, featuring guest author Jane Doe.",
    date: "2024-02-01",
    duration: "32 min",
    audioUrl: "#",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800"
  }
];

const SERVICE: Service = {
  id: "s1",
  title: "Private Meet & Greet",
  description: "An exclusive opportunity to sit down with Robert Ross Williams. Discuss history, the craft of writing, or share stories in a private setting.",
  price: 250.00,
  features: [
    "1-hour private video call or in-person (location dependent)",
    "Personalized signed book copy included",
    "Q&A session",
    "Mentorship on writing military fiction"
  ]
};

// --- Services (Simulated) ---

/**
 * In a real application, this would be replaced by:
 * import { createClient } from '@supabase/supabase-js'
 * const supabase = createClient(PROJECT_URL, ANON_KEY)
 */
class MockSupabase {
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null, error: string | null }> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    if (email === "admin@rrw.com" && password === "password") {
      const user: AuthUser = {
        id: "usr_admin_123",
        email: email,
        role: "admin",
        last_sign_in: new Date().toISOString()
      };
      localStorage.setItem('rrw_session', JSON.stringify(user));
      return { user, error: null };
    }
    return { user: null, error: "Invalid credentials" };
  }

  static async signOut(): Promise<void> {
    localStorage.removeItem('rrw_session');
  }

  static getSession(): AuthUser | null {
    const session = localStorage.getItem('rrw_session');
    return session ? JSON.parse(session) : null;
  }
}

// --- Components ---

const SectionHeading = ({ children, subtitle, dark }: { children: React.ReactNode; subtitle?: string; dark?: boolean }) => (
  <div className="text-center mb-12">
    <h2 className={`text-4xl font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>{children}</h2>
    {subtitle && <div className="h-1 w-20 bg-amber-600 mx-auto mb-4"></div>}
    {subtitle && <p className={`max-w-2xl mx-auto ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{subtitle}</p>}
  </div>
);

const Navbar = ({ cartCount, onOpenCart, onNavigateHome }: { cartCount: number, onOpenCart: () => void, onNavigateHome: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    onNavigateHome();
    setIsOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900 text-white shadow-lg py-4' : 'bg-slate-900/90 backdrop-blur md:bg-transparent text-white py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-wider font-serif cursor-pointer" onClick={() => scrollTo('hero')}>
          R.R. WILLIAMS
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {['About', 'Books', 'Podcasts', 'Store', 'Contact'].map((item) => (
            <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="hover:text-amber-400 transition-colors text-sm uppercase tracking-widest font-semibold">
              {item}
            </button>
          ))}
          <button onClick={onOpenCart} className="relative p-2 hover:text-amber-400 transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
            <button onClick={onOpenCart} className="relative p-2">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 absolute top-full w-full border-t border-slate-800">
          <div className="flex flex-col p-6 space-y-4">
            {['About', 'Books', 'Podcasts', 'Store', 'Contact'].map((item) => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-left text-lg hover:text-amber-400">
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section id="hero" className="relative h-screen flex items-center justify-center bg-slate-900 text-white overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524293581917-878a6d017c71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-900"></div>

    <div className="relative z-10 container mx-auto px-6 text-center">
      <div className="inline-block mb-4 px-3 py-1 border border-amber-500 text-amber-500 text-xs uppercase tracking-[0.2em]">
        Author & Veteran
      </div>
      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
        Robert Ross <br/> <span className="text-amber-500">Williams</span>
      </h1>
      <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto font-light">
        Chronicles of courage, history, and the unyielding human spirit.
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button onClick={() => document.getElementById('store')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded transition-all transform hover:scale-105 shadow-lg shadow-amber-900/20">
          Visit the Store
        </button>
      </div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-20 bg-stone-50">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className="w-full md:w-1/2 relative">
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-amber-600/30 rounded-lg transform -translate-x-2 -translate-y-2"></div>
            <img 
              src="https://images.unsplash.com/photo-1541182388496-acfa7a37e34d?auto=format&fit=crop&q=80&w=800" 
              alt="Author Writing" 
              className="relative rounded-lg shadow-2xl w-full object-cover aspect-[4/5]"
            />
        </div>
        <div className="w-full md:w-1/2">
          <div className="flex items-center gap-2 text-amber-700 font-bold mb-4">
            <Award size={24} />
            <span className="uppercase tracking-wider text-sm">The Veteran's Voice</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6 font-serif">Bridging the Gap Between Service & Storytelling</h2>
          <p className="text-slate-700 text-lg leading-relaxed mb-6">
            Robert Ross Williams served with distinction before turning his attention to the written word. 
            His experiences on the field shaped a unique perspective—one that values truth, brotherhood, and 
            the silent sacrifices made by those in uniform.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-8">
            Today, Robert writes not just to entertain, but to educate and heal. Through his novels and memoirs, 
            he invites readers into a world where courage is tested and resilience is the ultimate weapon.
          </p>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png" alt="Signature" className="h-12 opacity-60" />
        </div>
      </div>
    </div>
  </section>
);

const BooksShowcase = ({ books, onViewDetails }: { books: Book[], onViewDetails: (book: Book) => void }) => (
  <section id="books" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <SectionHeading subtitle="Explore the Bibliography">Selected Works</SectionHeading>
      
      <div className="grid md:grid-cols-3 gap-12">
        {books.map((book) => (
          <div key={book.id} className="group cursor-pointer" onClick={() => onViewDetails(book)}>
            <div className="relative mb-6 overflow-hidden rounded shadow-lg aspect-[2/3]">
              <img src={book.image} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white border border-white px-6 py-2 uppercase tracking-widest text-sm font-bold transition-opacity duration-300">
                  View Details
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-serif group-hover:text-amber-700 transition-colors">{book.title}</h3>
            <p className="text-amber-700 font-medium mb-2">{book.subtitle}</p>
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{book.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PodcastSection = ({ podcasts }: { podcasts: Podcast[] }) => (
  <section id="podcasts" className="py-24 bg-slate-900 text-white">
     <div className="container mx-auto px-6">
       <SectionHeading subtitle="The Frontline Dispatch" dark>Podcast & Audio</SectionHeading>
       
       <div className="grid lg:grid-cols-2 gap-8">
         {podcasts.map((podcast) => (
           <div key={podcast.id} className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row group border border-slate-700 hover:border-amber-600 transition-all">
             <div className="md:w-1/3 relative min-h-[200px]">
               <img src={podcast.image || "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5"} className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity" alt={podcast.title}/>
               <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play fill="white" className="ml-1" size={20} />
                  </div>
               </div>
             </div>
             <div className="p-6 md:w-2/3 flex flex-col justify-center">
               <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <Mic size={14} />
                  <span>Episode {podcast.id.replace(/\D/g,'')}</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span>{podcast.duration}</span>
               </div>
               <h3 className="text-xl font-bold font-serif mb-2">{podcast.title}</h3>
               <p className="text-slate-400 text-sm mb-6">{podcast.description}</p>
               <div className="mt-auto flex items-center justify-between border-t border-slate-700 pt-4">
                 <span className="text-xs text-slate-500">{podcast.date}</span>
                 <button className="text-sm font-bold hover:text-amber-500 flex items-center gap-2 transition-colors">
                   Listen Now <ChevronRight size={14} />
                 </button>
               </div>
             </div>
           </div>
         ))}
         
         {/* Call to Action / Subscribe */}
         <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-xl">
            <Headphones size={48} className="mb-4 text-amber-200" />
            <h3 className="text-2xl font-bold font-serif mb-2">Subscribe to the Show</h3>
            <p className="text-amber-100 mb-6">Don't miss an episode. Available on all major platforms.</p>
            <div className="flex gap-3">
               <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-bold text-sm backdrop-blur border border-white/20 transition-colors">Spotify</button>
               <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-bold text-sm backdrop-blur border border-white/20 transition-colors">Apple</button>
            </div>
         </div>
       </div>
     </div>
  </section>
);

const Store = ({ books, onAddToCart, onBookService, onViewDetails }: { books: Book[], onAddToCart: (item: Book) => void, onBookService: () => void, onViewDetails: (book: Book) => void }) => (
  <section id="store" className="py-20 bg-slate-50 border-t border-slate-200">
    <div className="container mx-auto px-6">
      <SectionHeading subtitle="Purchase Books & Experiences">The Store</SectionHeading>

      {/* Books Grid */}
      <div className="mb-20">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">Books</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col h-full">
              <div className="flex gap-6 mb-6 flex-1 cursor-pointer" onClick={() => onViewDetails(book)}>
                <div className="w-24 h-36 flex-shrink-0 shadow-md rounded overflow-hidden bg-slate-200">
                   <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 font-serif leading-tight mb-1 hover:text-amber-700">{book.title}</h4>
                  <p className="text-slate-500 text-sm mb-2">{book.type}</p>
                  <div className="text-amber-700 font-bold text-lg">${book.price.toFixed(2)}</div>
                </div>
              </div>
              <button 
                onClick={() => onAddToCart(book)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* VIP Service */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden text-white shadow-2xl">
        <div className="flex flex-col md:flex-row">
          <div className="p-10 md:w-2/3">
            <div className="inline-flex items-center gap-2 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Star size={12} fill="currentColor" />
              Exclusive Experience
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 font-serif">{SERVICE.title}</h3>
            <p className="text-slate-300 text-lg mb-8 max-w-xl">
              {SERVICE.description}
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {SERVICE.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 text-amber-500"><Check size={18} /></div>
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={onBookService}
              className="inline-flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded transition-all transform hover:translate-x-1"
            >
              <Calendar size={20} />
              Book Now - ${SERVICE.price}
            </button>
          </div>
          <div className="md:w-1/3 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center min-h-[300px] md:min-h-full relative">
            <div className="absolute inset-0 bg-slate-900/30"></div>
          </div>
        </div>
      </div>

    </div>
  </section>
);

const Contact = () => (
  <section id="contact" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto bg-stone-50 rounded-2xl p-8 md:p-12 shadow-lg border border-stone-200">
        <SectionHeading subtitle="Get in Touch">Contact</SectionHeading>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
              <input type="text" className="w-full p-4 rounded bg-white border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input type="email" className="w-full p-4 rounded bg-white border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all" placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
            <select className="w-full p-4 rounded bg-white border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all">
              <option>General Inquiry</option>
              <option>Press & Media</option>
              <option>Speaking Engagement</option>
              <option>Store Support</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
            <textarea rows={4} className="w-full p-4 rounded bg-white border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all" placeholder="How can we help you?"></textarea>
          </div>
          <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded transition-colors uppercase tracking-wider">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </section>
);

const Footer = ({ onOpenAdmin }: { onOpenAdmin: () => void }) => (
  <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h4 className="text-white font-serif font-bold text-xl mb-2">Robert Ross Williams</h4>
          <p className="text-sm opacity-70">Sharing the veteran experience through literature.</p>
        </div>
        <div className="flex gap-6 text-sm font-semibold uppercase tracking-widest">
          <a href="#" className="hover:text-amber-500 transition-colors">Twitter</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Facebook</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Instagram</a>
        </div>
      </div>
      <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-xs opacity-40 gap-4">
        <p>&copy; {new Date().getFullYear()} Robert Ross Williams. All rights reserved.</p>
        <button onClick={onOpenAdmin} className="flex items-center gap-1 hover:text-white transition-colors">
          <Lock size={10} /> Admin Access
        </button>
      </div>
    </div>
  </footer>
);

// --- Book Detail Page ---

const BookDetailPage = ({ 
  book, 
  comments, 
  likes,
  onAddComment,
  onLike,
  onSubscribe,
  onAddToCart
}: { 
  book: Book;
  comments: Comment[];
  likes: number;
  onAddComment: (bookId: string, author: string, content: string) => void;
  onLike: (bookId: string) => void;
  onSubscribe: (email: string, bookId: string) => void;
  onAddToCart: (book: Book) => void;
}) => {
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [email, setEmail] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authorName && commentText) {
      onAddComment(book.id, authorName, commentText);
      setAuthorName("");
      setCommentText("");
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubscribe(email, book.title);
      setIsFollowing(true);
    }
  };

  const handleShare = () => {
    const dummyUrl = `https://robertrosswilliams.com/books/${book.id}`;
    navigator.clipboard.writeText(dummyUrl).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] bg-slate-900 flex items-center overflow-hidden">
        <img src={book.image} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10 mt-20">
           <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-amber-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <BookOpen size={12} />
                {book.type}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-serif mb-4 leading-tight">{book.title}</h1>
              <p className="text-xl text-amber-100 font-medium mb-6">{book.subtitle}</p>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-20 relative z-20 mb-20">
        <div className="grid md:grid-cols-12 gap-12">
          
          {/* Left Sidebar (Cover & Actions) */}
          <div className="md:col-span-4 lg:col-span-3">
             <div className="bg-white rounded-lg shadow-2xl overflow-hidden p-2 mb-6">
                <img src={book.image} alt={book.title} className="w-full rounded border border-slate-100" />
             </div>
             
             <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-3xl font-bold text-slate-900">${book.price.toFixed(2)}</span>
                   <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">In Stock</span>
                </div>
                <button onClick={() => onAddToCart(book)} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-lg shadow-amber-600/20 transition-all">
                  Add to Cart
                </button>
                <div className="grid grid-cols-2 gap-2 text-center">
                   <button onClick={() => onLike(book.id)} className="flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-500 border border-slate-200 rounded font-medium transition-colors group">
                      <Heart size={18} className={likes > 0 ? "fill-red-500 text-red-500" : ""} />
                      <span>{likes}</span>
                   </button>
                   <button onClick={handleShare} className="flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 rounded font-medium transition-colors">
                      <Share2 size={18} />
                      <span>Share</span>
                   </button>
                </div>
             </div>

             {/* Meta Info */}
             <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm">
                <h4 className="font-bold text-slate-900 mb-4 border-b pb-2">Book Details</h4>
                <div className="space-y-3">
                   <div className="flex justify-between"><span className="text-slate-500">Format</span> <span className="font-medium">{book.type}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Pages</span> <span className="font-medium">{book.pages || 'N/A'}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">ISBN</span> <span className="font-medium">{book.isbn || 'N/A'}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Language</span> <span className="font-medium">English</span></div>
                </div>
             </div>
          </div>

          {/* Right Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-12">
            
            {/* Description */}
            <section>
              <h3 className="text-2xl font-bold text-slate-900 font-serif mb-6">About the Book</h3>
              <div className="prose prose-lg text-slate-700 leading-relaxed">
                <p className="mb-4 text-xl font-light text-slate-600 italic">{book.description}</p>
                <p>{book.longDescription || book.description}</p>
              </div>
            </section>

            {/* Social Proof: Follow */}
            <section className="bg-slate-900 text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <h4 className="text-2xl font-bold font-serif mb-2">Stay Updated</h4>
                <p className="text-slate-400">Get notified about signings and new editions of this book.</p>
              </div>
              {!isFollowing ? (
                <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="px-4 py-3 rounded bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-amber-500 outline-none min-w-[250px]"
                  />
                  <button type="submit" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded transition-colors">
                    Follow
                  </button>
                </form>
              ) : (
                 <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 px-6 py-3 rounded">
                    <Check size={20} /> You are following this book
                 </div>
              )}
            </section>

            {/* Comments Section */}
            <section>
               <div className="flex items-center gap-3 mb-8">
                 <MessageSquare className="text-amber-600" size={28} />
                 <h3 className="text-2xl font-bold text-slate-900 font-serif">Reader Reviews</h3>
               </div>

               {/* Comment List */}
               <div className="space-y-6 mb-10">
                  {comments.length > 0 ? comments.map(comment => (
                    <div key={comment.id} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">
                               {comment.author.charAt(0)}
                             </div>
                             <div>
                                <div className="font-bold text-slate-900">{comment.author}</div>
                                <div className="text-xs text-slate-500">{comment.date}</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-sm">
                             <ThumbsUp size={14} /> {comment.likes}
                          </div>
                       </div>
                       <p className="text-slate-700 ml-13 pl-13">{comment.content}</p>
                    </div>
                  )) : (
                    <p className="text-slate-500 italic">No reviews yet. Be the first to share your thoughts.</p>
                  )}
               </div>

               {/* Add Comment Form */}
               <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-lg mb-4">Leave a Review</h4>
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                       <input 
                          type="text" 
                          value={authorName}
                          onChange={e => setAuthorName(e.target.value)}
                          className="w-full p-3 border rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-600 outline-none"
                          placeholder="Your name"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-1">Review</label>
                       <textarea 
                          rows={3}
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          className="w-full p-3 border rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-600 outline-none"
                          placeholder="What did you think of the book?"
                       />
                     </div>
                     <button type="submit" className="px-8 py-3 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition-colors">
                        Post Review
                     </button>
                  </form>
               </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin Components ---

const AnalyticsDashboard = () => {
  // Mock Analytics Data
  const data: AnalyticsData = {
    totalRevenue: 14580.50,
    booksSold: 842,
    avgOrderValue: 32.45,
    goodreadsRating: 4.6,
    goodreadsReviews: 128,
    monthlySales: [
      { month: 'Jan', amount: 1200 },
      { month: 'Feb', amount: 1900 },
      { month: 'Mar', amount: 1500 },
      { month: 'Apr', amount: 2200 },
      { month: 'May', amount: 2800 },
      { month: 'Jun', amount: 2600 }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-green-100 p-3 rounded-lg text-green-600"><Activity size={24} /></div>
             <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12% this month</span>
           </div>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
           <h3 className="text-3xl font-bold text-slate-900">${data.totalRevenue.toLocaleString()}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><BookOpen size={24} /></div>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">+85 units</span>
           </div>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Books Sold</p>
           <h3 className="text-3xl font-bold text-slate-900">{data.booksSold}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-amber-100 p-3 rounded-lg text-amber-600"><TrendingUp size={24} /></div>
           </div>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Avg. Order Value</p>
           <h3 className="text-3xl font-bold text-slate-900">${data.avgOrderValue}</h3>
        </div>
      </div>

      {/* Charts & Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2"><BarChart3 size={20} /> Revenue Analytics</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {data.monthlySales.map((d, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-slate-900 rounded-t-sm group-hover:bg-amber-600 transition-colors relative" 
                  style={{height: `${(d.amount / 3000) * 100}%`}}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    ${d.amount}
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-bold uppercase">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goodreads Integration */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
             <Globe size={20} className="text-slate-400" />
             <h3 className="font-bold text-lg text-slate-900">Goodreads Integration</h3>
           </div>
           
           <div className="bg-[#F4F1EA] p-6 rounded-lg border border-[#E9E5DA] text-center mb-6">
             <div className="text-[#382110] font-serif font-bold text-xl mb-1">Author Rating</div>
             <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
               {[1,2,3,4,5].map(i => <Star key={i} size={24} fill={i <= Math.floor(data.goodreadsRating) ? "currentColor" : "none"} />)}
             </div>
             <div className="text-4xl font-bold text-slate-900 mb-1">{data.goodreadsRating}</div>
             <p className="text-xs text-slate-500">{data.goodreadsReviews} Verified Reviews</p>
           </div>

           <div className="space-y-3">
             <div className="flex justify-between text-sm">
               <span className="text-slate-600">Sync Status</span>
               <span className="text-green-600 font-bold flex items-center gap-1"><Check size={14} /> Active</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-600">Last Sync</span>
               <span className="text-slate-900 font-medium">2 mins ago</span>
             </div>
             <button className="w-full py-2 mt-4 border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2">
               <RefreshCw size={14} /> Force Refresh
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const DeveloperConsole = () => {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: 'k1', name: 'Production Read-Only', key: 'sk_live_51M...92x', created_at: '2024-02-10', last_used: '2024-05-20' }
  ]);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const generateKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substr(2, 24)}`;
    setKeys([...keys, {
      id: `k${Date.now()}`,
      name: 'New API Key',
      key: newKey,
      created_at: new Date().toISOString().split('T')[0],
      last_used: null
    }]);
    setShowKeyModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2"><Key className="text-amber-500" /> Developer API</h2>
            <p className="text-slate-400 max-w-2xl">
              Securely access user data, transaction history, and book inventory via our REST API. 
              Use these keys to build custom integrations or connect to third-party analytics tools.
            </p>
          </div>
          <button 
            onClick={() => setShowKeyModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Generate New Key
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Active API Keys</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-6">Name</th>
              <th className="p-6">Token</th>
              <th className="p-6">Created</th>
              <th className="p-6">Last Used</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {keys.map(k => (
              <tr key={k.id} className="hover:bg-slate-50">
                <td className="p-6 font-medium text-slate-900">{k.name}</td>
                <td className="p-6 font-mono text-xs text-slate-500 bg-slate-100 rounded w-fit">
                  {k.key.substring(0, 12)}••••••••
                </td>
                <td className="p-6 text-slate-500 text-sm">{k.created_at}</td>
                <td className="p-6 text-slate-500 text-sm">{k.last_used || 'Never'}</td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => {
                       navigator.clipboard.writeText(k.key);
                       alert('Full API Key copied to clipboard');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider mr-4"
                  >
                    Copy
                  </button>
                  <button className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider">Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl flex gap-4 items-start">
        <Shield className="text-amber-600 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-amber-800 mb-1">Security Warning</h4>
          <p className="text-amber-700 text-sm">
            Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
          </p>
        </div>
      </div>

      {/* Modal for key generation (simplified) */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
             <h3 className="font-bold text-lg mb-4">Generate New API Key</h3>
             <p className="text-slate-500 text-sm mb-6">This will create a new secret key for the production environment.</p>
             <div className="flex justify-end gap-3">
               <button onClick={() => setShowKeyModal(false)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
               <button onClick={generateKey} className="px-4 py-2 bg-amber-600 text-white rounded font-bold">Create Key</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simulate Supabase Auth
    const { user, error } = await MockSupabase.signIn(email, pass);
    
    setLoading(false);
    if (user) {
      onLogin();
      setEmail("");
      setPass("");
    } else {
      setError(error || "Authentication failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
         <div className="bg-slate-950 p-6 text-white flex justify-between items-center">
           <h3 className="font-bold flex items-center gap-2"><Database size={16} /> Admin Portal</h3>
           <button onClick={onClose}><X size={20} /></button>
         </div>
         <form onSubmit={handleSubmit} className="p-6 space-y-4">
           {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-100">{error}</div>}
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded focus:border-amber-600 outline-none" placeholder="admin@rrw.com" />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
             <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-2 border rounded focus:border-amber-600 outline-none" placeholder="password" />
           </div>
           <p className="text-xs text-slate-400 italic">Powered by Supabase Auth</p>
           <button disabled={loading} type="submit" className="w-full py-2 bg-amber-600 text-white font-bold rounded hover:bg-amber-700 flex justify-center">
             {loading ? "Authenticating..." : "Login"}
           </button>
         </form>
       </div>
    </div>
  );
};

const EditBookModal = ({ book, isOpen, onClose, onSave }: { book: Book | null, isOpen: boolean, onClose: () => void, onSave: (b: Book) => void }) => {
  const [formData, setFormData] = useState<Book | null>(null);

  useEffect(() => {
    if (book) setFormData({ ...book });
  }, [book]);

  if (!isOpen || !formData) return null;

  const handleChange = (key: keyof Book, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [key]: value }) : null);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="text-xl font-bold font-serif text-slate-900">Edit Book Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X size={24}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
              <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Subtitle</label>
              <input type="text" value={formData.subtitle} onChange={e => handleChange('subtitle', e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" value={formData.price} onChange={e => handleChange('price', parseFloat(e.target.value))} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Format</label>
              <select value={formData.type} onChange={e => handleChange('type', e.target.value)} className="w-full p-2 border rounded bg-white">
                <option value="Hardcover">Hardcover</option>
                <option value="Paperback">Paperback</option>
                <option value="E-Book">E-Book</option>
              </select>
            </div>
          </div>

          <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Image URL</label>
              <div className="flex gap-2">
                <input type="text" value={formData.image} onChange={e => handleChange('image', e.target.value)} className="w-full p-2 border rounded flex-1" />
                <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0 bg-slate-100">
                  <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                </div>
              </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Short Description</label>
            <textarea rows={3} value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full p-2 border rounded"></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Long Description</label>
            <textarea rows={5} value={formData.longDescription || formData.description} onChange={e => handleChange('longDescription', e.target.value)} className="w-full p-2 border rounded"></textarea>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:text-slate-900">Cancel</button>
          <button onClick={() => { onSave(formData); onClose(); }} className="px-6 py-2 bg-amber-600 text-white font-bold rounded hover:bg-amber-700 flex items-center gap-2">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const PodcastManager = ({ podcasts, onAdd, onDelete }: { podcasts: Podcast[], onAdd: (p: Podcast) => void, onDelete: (id: string) => void }) => {
  const [newPodcast, setNewPodcast] = useState<Partial<Podcast>>({
    title: "",
    description: "",
    duration: "",
    audioUrl: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleAdd = () => {
    if (newPodcast.title && newPodcast.audioUrl) {
      onAdd({
        id: `p${Date.now()}`,
        ...newPodcast as Podcast
      });
      setNewPodcast({ title: "", description: "", duration: "", audioUrl: "", date: new Date().toISOString().split('T')[0] });
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Mic size={20} className="text-amber-600"/> Upload New Episode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <input 
              placeholder="Episode Title" 
              value={newPodcast.title}
              onChange={e => setNewPodcast({...newPodcast, title: e.target.value})}
              className="p-3 border rounded bg-slate-50"
           />
           <div className="flex gap-2">
             <input 
                placeholder="Duration (e.g. 45 min)" 
                value={newPodcast.duration}
                onChange={e => setNewPodcast({...newPodcast, duration: e.target.value})}
                className="p-3 border rounded bg-slate-50 flex-1"
             />
             <input 
                type="date"
                value={newPodcast.date}
                onChange={e => setNewPodcast({...newPodcast, date: e.target.value})}
                className="p-3 border rounded bg-slate-50"
             />
           </div>
        </div>
        <textarea 
           placeholder="Episode Description"
           value={newPodcast.description}
           onChange={e => setNewPodcast({...newPodcast, description: e.target.value})}
           className="w-full p-3 border rounded bg-slate-50 mb-4"
           rows={2}
        ></textarea>
        <div className="flex gap-4">
           <input 
              placeholder="Audio Source URL (MP3 link, Spotify, etc.)"
              value={newPodcast.audioUrl}
              onChange={e => setNewPodcast({...newPodcast, audioUrl: e.target.value})}
              className="flex-1 p-3 border rounded bg-slate-50"
           />
           <button onClick={handleAdd} className="px-6 py-3 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 flex items-center gap-2">
             <Plus size={18} /> Add Episode
           </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg">Podcast Library</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {podcasts.map(podcast => (
            <div key={podcast.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{podcast.title}</h4>
                    <div className="text-xs text-slate-500 flex gap-2">
                       <span>{podcast.date}</span>
                       <span>•</span>
                       <span>{podcast.duration}</span>
                    </div>
                  </div>
               </div>
               <button onClick={() => onDelete(podcast.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors">
                  <Trash2 size={18} />
               </button>
            </div>
          ))}
          {podcasts.length === 0 && (
             <div className="p-10 text-center text-slate-400">No podcasts uploaded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ 
  books, 
  comments,
  subscribers,
  podcasts,
  onLogout, 
  onUpdateBook, 
  onReturn,
  onDeleteComment,
  onAddPodcast,
  onDeletePodcast
}: { 
  books: Book[], 
  comments: Comment[],
  subscribers: Subscriber[],
  podcasts: Podcast[],
  onLogout: () => void, 
  onUpdateBook: (b: Book) => void, 
  onReturn: () => void,
  onDeleteComment: (id: string) => void,
  onAddPodcast: (p: Podcast) => void,
  onDeletePodcast: (id: string) => void
}) => {
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'moderation' | 'users' | 'podcasts' | 'analytics' | 'developers'>('inventory');

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-2 rounded">
              <Lock size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Admin Panel</h1>
              <p className="text-xs text-slate-400">Authenticated via Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onReturn} className="text-sm text-slate-300 hover:text-white flex items-center gap-2">
               <ArrowLeft size={16} /> Return to Site
            </button>
            <div className="h-6 w-px bg-slate-700"></div>
            <button onClick={onLogout} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2">
               <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="container mx-auto px-6 mt-2">
           <div className="flex space-x-1 overflow-x-auto no-scrollbar">
              {['inventory', 'podcasts', 'moderation', 'users', 'analytics', 'developers'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  {tab}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        
        {/* Analytics View */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* Developers View */}
        {activeTab === 'developers' && <DeveloperConsole />}

        {/* Inventory View */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Books Inventory</h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{books.length} Items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-6">Product</th>
                    <th className="p-6">Format</th>
                    <th className="p-6">Price</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0 border border-slate-300">
                            <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{book.title}</div>
                            <div className="text-sm text-slate-500">{book.subtitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded">
                          {book.type}
                        </span>
                      </td>
                      <td className="p-6 font-mono text-slate-700 font-bold">
                        ${book.price.toFixed(2)}
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => setEditingBook(book)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-600 text-slate-600 rounded-lg transition-all shadow-sm font-medium text-sm"
                        >
                          <Edit size={16} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Podcast View */}
        {activeTab === 'podcasts' && (
           <PodcastManager 
             podcasts={podcasts} 
             onAdd={onAddPodcast} 
             onDelete={onDeletePodcast}
           />
        )}

        {/* Moderation View */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">User Comments</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-6">User</th>
                      <th className="p-6">Comment</th>
                      <th className="p-6">Book ID</th>
                      <th className="p-6">Date</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {comments.map(comment => (
                      <tr key={comment.id}>
                         <td className="p-6 font-bold text-slate-800">{comment.author}</td>
                         <td className="p-6 text-slate-600 max-w-md truncate" title={comment.content}>{comment.content}</td>
                         <td className="p-6 text-xs text-slate-500 font-mono">{comment.bookId}</td>
                         <td className="p-6 text-slate-500 text-sm">{comment.date}</td>
                         <td className="p-6 text-right">
                            <button onClick={() => onDeleteComment(comment.id)} className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded">
                               <Trash2 size={18} />
                            </button>
                         </td>
                      </tr>
                    ))}
                    {comments.length === 0 && (
                      <tr><td colSpan={5} className="p-10 text-center text-slate-400">No comments to moderate.</td></tr>
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* User/Subscriber View */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Subscribers & Followers</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-6">Email</th>
                      <th className="p-6">Source Context</th>
                      <th className="p-6">Date Added</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {subscribers.map((sub, i) => (
                      <tr key={i}>
                         <td className="p-6 font-bold text-slate-800">{sub.email}</td>
                         <td className="p-6 text-slate-600">{sub.source}</td>
                         <td className="p-6 text-slate-500 text-sm">{sub.date}</td>
                      </tr>
                    ))}
                    {subscribers.length === 0 && (
                      <tr><td colSpan={3} className="p-10 text-center text-slate-400">No subscribers yet.</td></tr>
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        )}

      </div>
      
      <EditBookModal 
        isOpen={!!editingBook} 
        book={editingBook} 
        onClose={() => setEditingBook(null)} 
        onSave={onUpdateBook} 
      />
    </div>
  );
};

// --- Modals ---

const BookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your request. Our team will contact you shortly to finalize the schedule.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold font-serif">Request Meet & Greet</h3>
          <button onClick={onClose} className="hover:text-amber-400 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded text-sm text-amber-800">
            You are requesting a private session. Please provide your availability preferences below.
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input required type="text" className="w-full p-3 border rounded focus:ring-1 focus:ring-amber-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
              <input required type="email" className="w-full p-3 border rounded focus:ring-1 focus:ring-amber-600 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Preferred Date</label>
            <input type="date" className="w-full p-3 border rounded focus:ring-1 focus:ring-amber-600 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Topic of Interest</label>
             <select className="w-full p-3 border rounded focus:ring-1 focus:ring-amber-600 outline-none">
              <option>General Discussion</option>
              <option>Writing Advice</option>
              <option>Military History</option>
              <option>Speaking Inquiry</option>
            </select>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded transition-colors">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CartModal = ({ isOpen, onClose, items, onRemove }: { isOpen: boolean; onClose: () => void; items: Book[]; onRemove: (id: string) => void }) => {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold font-serif text-slate-900">Your Cart</h2>
          <button onClick={onClose}><X size={24} className="text-slate-500 hover:text-slate-900" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
              <p>Your cart is empty.</p>
              <button onClick={onClose} className="mt-4 text-amber-600 font-bold hover:underline">Continue Shopping</button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4">
                <div className="w-16 h-24 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 font-serif line-clamp-1">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.type}</p>
                  <p className="text-amber-700 font-bold mt-1">${item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-slate-400 hover:text-red-500 self-start">
                  <X size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-slate-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button 
                onClick={() => { alert('Checkout functionality would be implemented here.'); onClose(); }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  // Data State
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('rrw_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('rrw_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [likes, setLikes] = useState<Record<string, number>>(() => {
     const saved = localStorage.getItem('rrw_likes');
     return saved ? JSON.parse(saved) : { "b1": 124, "b2": 89, "b3": 45 };
  });

  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    const saved = localStorage.getItem('rrw_subscribers');
    return saved ? JSON.parse(saved) : [];
  });

  const [podcasts, setPodcasts] = useState<Podcast[]>(() => {
    const saved = localStorage.getItem('rrw_podcasts');
    return saved ? JSON.parse(saved) : INITIAL_PODCASTS;
  });

  useEffect(() => { localStorage.setItem('rrw_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('rrw_comments', JSON.stringify(comments)); }, [comments]);
  useEffect(() => { localStorage.setItem('rrw_likes', JSON.stringify(likes)); }, [likes]);
  useEffect(() => { localStorage.setItem('rrw_subscribers', JSON.stringify(subscribers)); }, [subscribers]);
  useEffect(() => { localStorage.setItem('rrw_podcasts', JSON.stringify(podcasts)); }, [podcasts]);

  // UI State
  const [cart, setCart] = useState<Book[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [view, setView] = useState<'home' | 'admin' | 'book-detail'>('home');
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  
  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    const session = MockSupabase.getSession();
    if (session) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const addToCart = (book: Book) => {
    setCart([...cart, book]);
    setIsCartOpen(true);
  };

  const removeFromCart = (bookId: string) => {
    const index = cart.findIndex(i => i.id === bookId);
    if (index > -1) {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
    }
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setShowLoginModal(false);
    setView('admin');
  };

  const handleAdminLogout = async () => {
    await MockSupabase.signOut();
    setIsAdminLoggedIn(false);
    setView('home');
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  const navigateToBook = (book: Book) => {
    setActiveBookId(book.id);
    setView('book-detail');
    window.scrollTo(0,0);
  };

  // Social Actions
  const handleAddComment = (bookId: string, author: string, content: string) => {
     const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        bookId,
        author,
        content,
        date: new Date().toISOString().split('T')[0],
        likes: 0
     };
     setComments([newComment, ...comments]);
  };

  const handleLike = (bookId: string) => {
     setLikes(prev => ({
        ...prev,
        [bookId]: (prev[bookId] || 0) + 1
     }));
  };

  const handleSubscribe = (email: string, source: string) => {
     setSubscribers([...subscribers, { email, source, date: new Date().toLocaleDateString() }]);
  };

  const handleDeleteComment = (id: string) => {
     setComments(comments.filter(c => c.id !== id));
  };

  // Podcast Actions
  const handleAddPodcast = (podcast: Podcast) => {
    setPodcasts([podcast, ...podcasts]);
  };

  const handleDeletePodcast = (id: string) => {
    setPodcasts(podcasts.filter(p => p.id !== id));
  };

  // Render Views

  if (view === 'admin' && isAdminLoggedIn) {
    return (
      <AdminDashboard 
        books={books} 
        comments={comments}
        subscribers={subscribers}
        podcasts={podcasts}
        onLogout={handleAdminLogout} 
        onUpdateBook={handleUpdateBook}
        onDeleteComment={handleDeleteComment}
        onReturn={() => setView('home')}
        onAddPodcast={handleAddPodcast}
        onDeletePodcast={handleDeletePodcast}
      />
    );
  }

  if (view === 'book-detail' && activeBookId) {
    const book = books.find(b => b.id === activeBookId);
    if (book) {
       return (
         <div className="bg-white min-h-screen flex flex-col">
            <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} onNavigateHome={() => setView('home')} />
            <BookDetailPage 
               book={book}
               comments={comments.filter(c => c.bookId === book.id)}
               likes={likes[book.id] || 0}
               onAddComment={handleAddComment}
               onLike={handleLike}
               onSubscribe={handleSubscribe}
               onAddToCart={addToCart}
            />
            <Footer onOpenAdmin={() => setShowLoginModal(true)} />
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={removeFromCart} />
         </div>
       );
    }
  }

  // Default: Home View
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} onNavigateHome={() => setView('home')} />
      
      <main className="flex-grow">
        <Hero />
        <About />
        <BooksShowcase books={books} onViewDetails={navigateToBook} />
        <PodcastSection podcasts={podcasts} />
        <Store 
          books={books}
          onAddToCart={addToCart} 
          onBookService={() => setIsBookingOpen(true)} 
          onViewDetails={navigateToBook}
        />
        <Contact />
      </main>

      <Footer onOpenAdmin={() => setShowLoginModal(true)} />

      {/* Overlays */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart} 
      />
      <AdminLoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleAdminLogin}
      />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);