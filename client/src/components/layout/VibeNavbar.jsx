import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function VibeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const sectionLinks = [
    { label: 'Product', id: 'how-it-works' },
    { label: 'Pricing', id: 'features' },
    { label: 'About', id: 'stats' },
    { label: 'Contact', id: 'final-cta' },
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4 md:px-12 md:py-6 ${scrolled ? 'bg-surface-950/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-display font-bold text-lg">P</div>
          <span className="font-display font-bold text-xl tracking-tight text-white">ParkFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {sectionLinks.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="text-sm font-medium text-surface-400 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link 
            to="/login" 
            className="text-sm font-medium text-white hover:text-primary-400 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="bg-white text-surface-950 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-surface-200 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
