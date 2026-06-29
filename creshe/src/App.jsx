import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, ArrowUp, ChevronDown, Phone as WhatsApp } from 'lucide-react';

import Home from './Components/Home';
import About from './Components/About';
import Staff from './Components/Staff';
import Academics from './Components/Academics';
import Facilities from './Components/Facilities';
import Gallery from './Components/Gallery';
import ContactUs from './Components/ContactUs';
import EnrollmentPortal from './Components/Enrollement';
import AdminPortal from './Components/Admin/AdminPortal';
import logo from './assets/logo1.jpg';
import './App.css';

function FrontendApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNav = (tab, category = 'All') => {
    setActiveTab(tab);
    if (tab === 'gallery') {
      setGalleryCategory(category);
    }
    setIsAboutDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Sticky Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || activeTab !== 'home'
            ? 'bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md shadow-md py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNav('home')}
          >
            <img src={logo} alt="CRÈCHE ARCHE DES ANGES de Bugesera" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-105" />
            <div className={`flex flex-col items-center justify-center transition-colors ${
              isScrolled || activeTab !== 'home' ? 'text-blue-950 dark:text-blue-400' : 'text-white drop-shadow-md'
            }`}>
              <span className="font-extrabold text-lg md:text-xl tracking-tight leading-tight">
                CRÈCHE ARCHE DES ANGES
              </span>
              <span className="font-extrabold text-lg md:text-xl tracking-tight uppercase leading-none">
                de Bugesera
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 font-bold text-sm">
            <button onClick={() => handleNav('home')} className={`transition-colors hover:text-blue-900 ${isScrolled || activeTab !== 'home' ? 'text-white dark:text-slate-200' : 'text-white drop-shadow-sm'}`}>Home</button>
            
            {/* About Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsAboutDropdownOpen(true)}
              onMouseLeave={() => setIsAboutDropdownOpen(false)}
            >
              <button className={`flex items-center gap-1 transition-colors hover:text-blue-900 ${isScrolled || activeTab !== 'home' ? 'text-white dark:text-slate-200' : 'text-white drop-shadow-sm'}`}>
                About <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {isAboutDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 border border-slate-100 dark:border-slate-700 overflow-hidden"
                  >
                    <button onClick={() => handleNav('about')} className="block w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">Our Story & Mission</button>
                    <button onClick={() => handleNav('staff')} className="block w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">Staff</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => handleNav('academics')} className={`transition-colors hover:text-blue-900 ${isScrolled || activeTab !== 'home' ? 'text-slate-700 dark:text-slate-200' : 'text-white drop-shadow-sm'}`}>Academics</button>
            <button onClick={() => handleNav('facilities')} className={`transition-colors hover:text-blue-900 ${isScrolled || activeTab !== 'home' ? 'text-slate-700 dark:text-slate-200' : 'text-white drop-shadow-sm'}`}>Facilities</button>
            <button onClick={() => handleNav('gallery')} className={`transition-colors hover:text-blue-900 ${isScrolled || activeTab !== 'home' ? 'text-slate-700 dark:text-slate-200' : 'text-white drop-shadow-sm'}`}>Gallery</button>
            <button onClick={() => handleNav('contact')} className={`transition-colors hover:text-blue-900 ${isScrolled || activeTab !== 'home' ? 'text-slate-700 dark:text-slate-200' : 'text-white drop-shadow-sm'}`}>Contact Us</button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${
                isScrolled || activeTab !== 'home' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => handleNav('portal')}
              className="bg-secondary text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-yellow-400 transition-all transform hover:-translate-y-0.5"
            >
              Enroll Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`lg:hidden p-2 ${isScrolled || activeTab !== 'home' ? 'text-slate-800 dark:text-white' : 'text-white drop-shadow-sm'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 mt-3"
            >
              <div className="px-4 py-4 space-y-3 font-bold text-slate-700 dark:text-slate-200">
                <button onClick={() => handleNav('home')} className="block w-full text-left py-2">Home</button>
                <button onClick={() => handleNav('about')} className="block w-full text-left py-2">About Us</button>
                <button onClick={() => handleNav('staff')} className="block w-full text-left py-2">Staff</button>
                <button onClick={() => handleNav('academics')} className="block w-full text-left py-2">Academics</button>
                <button onClick={() => handleNav('facilities')} className="block w-full text-left py-2">Facilities</button>
                <button onClick={() => handleNav('gallery')} className="block w-full text-left py-2">Gallery</button>
                <button onClick={() => handleNav('contact')} className="block w-full text-left py-2">Contact Us</button>
                <button onClick={() => handleNav('portal')} className="block w-full text-left py-2 text-primary">Enroll Now</button>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center gap-2 py-2"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} Toggle Theme
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="min-h-screen relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Home key="home" handleNav={handleNav} />}
          {activeTab === 'about' && <About key="about" />}
          {activeTab === 'staff' && <Staff key="staff" />}
          {activeTab === 'academics' && <Academics key="academics" />}
          {activeTab === 'facilities' && <Facilities key="facilities" handleNav={handleNav} />}
          {activeTab === 'gallery' && <Gallery key="gallery" initialCategory={galleryCategory} />}
          {activeTab === 'contact' && <ContactUs key="contact" />}
          {activeTab === 'portal' && <EnrollmentPortal key="portal" />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-blue-800/50 pb-12">
          
          {/* Left: Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="CRÈCHE ARCHE DES ANGES de Bugesera" className="w-12 h-12 rounded-full border-2 border-white" />
              <span className="font-extrabold text-xl tracking-wide">ARCHE DES ANGES de Bugesera</span>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
              CRÈCHE ARCHE DES ANGES de Bugesera is dedicated to providing a loving, safe and inspiring environment where every child can learn, play and grow.
            </p>
          </div>

          {/* Middle: Links */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg tracking-widest uppercase">Quick Links</h4>
            <ul className="space-y-3 text-sm font-medium text-blue-100">
              <li><button onClick={() => handleNav('home')} className="hover:text-white hover:underline transition-all">Home</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-white hover:underline transition-all">About</button></li>
              <li><button onClick={() => handleNav('academics')} className="hover:text-white hover:underline transition-all">Academics</button></li>
              <li><button onClick={() => handleNav('facilities')} className="hover:text-white hover:underline transition-all">Facilities</button></li>
              <li><button onClick={() => handleNav('gallery')} className="hover:text-white hover:underline transition-all">Gallery</button></li>
              <li><button onClick={() => handleNav('contact')} className="hover:text-white hover:underline transition-all">Contact</button></li>
            </ul>
          </div>

          {/* Right: Socials */}
          <div className="space-y-6">
            <h4 className="font-bold text-lg tracking-widest uppercase">Connect With Us</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                <WhatsApp className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 text-center text-xs text-blue-200">
          <p>
            © {new Date().getFullYear()} CRÈCHE ARCHE DES ANGES de Bugesera. All Rights Reserved. <span className="mx-2">||</span> Developed under <a href="https://www.trusterlabs.com/" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-white hover:underline transition-colors">TRUSTER LABs</a>
          </p>
        </div>
      </footer>

      {/* Scroll to Top */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 p-3 bg-secondary text-slate-900 rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all z-40 cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/250791756343" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-2xl hover:bg-[#1EBE57] hover:-translate-y-1 transition-all group"
      >
        <span className="font-extrabold text-[15px] tracking-wide">WhatsApp us</span>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 drop-shadow-sm">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<FrontendApp />} />
      <Route path="/portal/superadmin-secure-login/*" element={<AdminPortal />} />
    </Routes>
  );
}

export default App;
