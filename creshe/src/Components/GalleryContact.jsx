import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PlayCircle, Star, Sparkles, MapPin, Phone, Mail, Clock, Send, MessageSquare, Eye, ZoomIn, Info } from 'lucide-react';

const PHOTOS = [
  {
    id: '1',
    title: 'The Joy of Soap Bubbles',
    category: 'playing',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb-haOBmSg-yJHHtBCldarT0e_XjFCuZdz1xWgAd1Uz3hhEynhE_zCMIQJ1NmcXtQkJQLjM94OEGlb2_UGVWkrYQ_lTV2G4pgr2xqsKSjzHoqm-bKHAw3I5H8RlOeMSpLUPIoa0IX-90zZdd2CzjH-cFzlbd5TXK3vMlY8d85UvQA0We8dFWfM11hxL7y9l97_op2La-sxtYuo1Pf6CSDu8-DCsqN3N4_cZgqKlus6XTIbIFOgzRv7Hh_9T0_Ig0C6Do20jGbD5hs',
    description: "A fun activity for learning cause and effect and hand-eye coordination.",
    ageGroup: 'Babies & Toddlers'
  },
  {
    id: '2',
    title: 'Sensory Awakening with Seasonal Vegetables',
    category: 'learning',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByuHSzdaRLaT7Ve9EBCY1KTij6I6koEicPhiBOCmTzbUYrJWCC15nWar-6Fyw46LtHpGMHKBozq9FuFM95GmTZU4jtMwmj0Mhqn2857sR39MUJKjSawL0E155hC60473ZrkLF1fQDOCgBAfG4JkrW4ItAOGBOOpA-yTHXSunfYnkRpYWdCxrNqtwc3TlmBHW9wXj74UfjYF9bgRP05Iwx2cnfWFG6M2CYbkffNFC4WLSacK-NBjlxPHJCbI0JMSmwTnzilJop5IEo',
    description: 'Tactile and olfactory discovery led by our pediatric chef to encourage food curiosity.',
    ageGroup: 'All groups'
  },
  {
    id: '3',
    title: 'Collective Digital Painting',
    category: 'arts',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnAnSPJWiAJKwdDQ9YyrG65ohhkxM1mnJ7QgLpaFYYmKo4V_6MMwAhqYyJvNVKvX4R9kVVTyPh_AVdhkB0KMKkg6zt3UOsTnzcIpzQdllZiQUb_Z2dWlMcYuHxQIjKF8-KljMmQuXq0ENKiUR6S6duAPhUjTYOHwDHEDUL-QobuniL-nEJUx-DHS_LobSMrBMO9-v-J3QUJnd0Q53QqXXNtqFsB4XZX-Yt09LkxJX5G4u4ICwagSs5HD-uV5mL_0SDhMrpuARkHLI',
    description: 'Giving free rein to creativity with homemade organic vegetable paint, totally harmless.',
    ageGroup: 'Preschoolers (24-36 months)'
  },
  {
    id: '4',
    title: 'Balance & Confidence Course',
    category: 'sports',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKeuzgfud4TKewV6-kc8vEpS4BfD4JrDs8F4UYKWZtH-75PLe9A5oLo2mOLcqavdYrMUOsQivtlueeVfzEKHLbLdv5KHH8nOBImT7NcFxm7_IBpvy0saev_2MAgVJIEB7i-Co8Pn1mW5NnzF_GALhHlCl45Wof_rTPWvjXGXZYyYr5t_eoCmS7KPYcUAdCagsYNnQOqx7dtvGUZGKzU7VugR-14fo0tOhAPw80yE5QvRquEs9Smlx-NO4BUYWNSx2Z-0PI22PxwE8',
    description: 'Motor skills path to consolidate coordination, stimulate proprioception and bodily confidence.',
    ageGroup: 'Toddlers & Preschoolers'
  },
  {
    id: '5',
    title: 'Outdoor Exploration & Eco-Games',
    category: 'playing',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJzv6R8rKpL0Yz1h3bFJuTfPAPJclHUeKrNly5KMDw7Z420CbBw-9f073iTPllLxHhAb3VP4CFYoNRS7ZR8IYv715Tgdv1VXQTPtg-LNekITmOC8oe8Pm1tv2C-08vz9McBrwO2ee4itupT3Ke-mssf4ZTUcWBC9ikWeitOPiwlXyexzk5C0su3e7Mw2YncmLkHafNaNQ2nNVZJbu8IJB34K_wfGPcC7J15nsceKBmHRr-MOwi73BMom3HrsMvJPQgqiCTqKkRYu4',
    description: 'Nature workshops organized in our private wooded patio to breathe and understand plant life.',
    ageGroup: 'All groups'
  },
  {
    id: '6',
    title: 'Shared Animated Reading',
    category: 'learning',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxvdD9fysI9sfA1Z3VqN0sVy-ocR2VXB5yt11F8vHB9NAsFvfBXz7d6QDCDPHCQecWFhLTyxlXO4On-49qXOZpuMRXCNTi8NWuFzPnD1fzFeWl-NiLyU3q3wfrWQ7Y6y4-q3-3EswyKRHo9vOZPWifegHOMMQd_feVBU8ofCiDHK__TiFLgoA7a2NklsgXTZ9SxJMBAd2OzwkyTw7C4c4ZeD5g3q9KCwePg-9rl81VM1zdJNX8yGrQdeSgmNqJnFp-I9gQv8OxC3k',
    description: 'Bilingual stories told with puppets to promote early vocabulary and listening.',
    ageGroup: 'Toddlers & Preschoolers'
  }
];

export default function GalleryContact({ initialScrollToContact = false }) {
  const [filter, setFilter] = useState('all');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Form States
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Request for a Private Visit');
  const [message, setMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [messagesHistory, setMessagesHistory] = useState([]);

  useEffect(() => {
    // Load existing messages
    const existing = localStorage.getItem('creche_messages');
    if (existing) {
      try {
        setMessagesHistory(JSON.parse(existing));
      } catch (e) {
        console.error(e);
      }
    }

    if (initialScrollToContact) {
      setTimeout(() => {
        document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [initialScrollToContact]);

  const filteredPhotos = filter === 'all' 
    ? PHOTOS 
    : PHOTOS.filter(photo => photo.category === filter);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!parentName || !email || !message) {
      return alert("Please fill out the mandatory fields (Name, Email, Message).");
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      parentName,
      email,
      phone,
      subject,
      message,
      date: new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updated = [newMessage, ...messagesHistory];
    setMessagesHistory(updated);
    localStorage.setItem('creche_messages', JSON.stringify(updated));

    // Reset Form
    setParentName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setFormSuccess(true);

    setTimeout(() => {
      setFormSuccess(false);
    }, 6000);
  };

  const handleClearHistory = () => {
    if (confirm("Do you want to clear your local message history?")) {
      localStorage.removeItem('creche_messages');
      setMessagesHistory([]);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* ==================== PHOTO GALLERY ==================== */}
      <section className="space-y-8">
        <div className="text-center space-y-4 pt-6 max-w-3xl mx-auto px-4">
          <span className="text-xs font-bold text-[#EC8F5E] uppercase tracking-wider">Life at Arche des Anges de Bugesera in Pictures</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2B3A4F]">The World of Our Little Angels</h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Every day is an exploration adventure. We capture these moments of bilingual grace to offer you absolute transparency on the blooming of your children.
          </p>

          {/* Filtering buttons */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              { code: 'all', label: 'All Photos' },
              { code: 'playing', label: 'Games & Outdoors' },
              { code: 'learning', label: 'Montessori Awakening' },
              { code: 'sports', label: 'Motor Skills Course' },
              { code: 'arts', label: 'Arts & Music' }
            ].map(tab => (
              <button
                id={`gallery-filter-${tab.code}`}
                key={tab.code}
                onClick={() => setFilter(tab.code)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all shadow-2xs cursor-pointer ${
                  filter === tab.code 
                    ? 'bg-[#8F80B3] text-white shadow-sm' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-150'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div id="gallery-photo-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                key={photo.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-2xs hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => setLightboxPhoto(photo)}
              >
                {/* Photo frame */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img 
                    src={photo.url} 
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Hover icon */}
                  <div className="absolute inset-0 bg-[#2B3A4F]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white text-[#2B3A4F] flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <ZoomIn className="w-5 h-5 text-[#EC8F5E]" />
                    </div>
                  </div>

                  <span className="absolute bottom-3 left-3 bg-[#FAF0E6]/90 backdrop-blur-xs text-[10px] font-bold text-[#2B3A4F] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {photo.ageGroup}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-[#2B3A4F] text-sm md:text-base group-hover:text-[#EC8F5E] transition-colors">{photo.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{photo.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CONTACT US & MAP ==================== */}
      <section id="contact-form-section" className="max-w-7xl mx-auto px-4 md:px-8 border-t border-slate-150 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Panel: Contact info & static Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3 text-center lg:text-left">
              <span className="text-xs font-bold text-[#64CCC5] uppercase tracking-wider">Visit & Contact Us</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#2B3A4F]">We're Waiting for You at Arche des Anges de Bugesera!</h2>
              <p className="text-slate-500 text-sm md:text-base">
                Located in the heart of Paris, we gladly welcome you to present our spaces by appointment.
              </p>
            </div>

            {/* Practical list */}
            <div className="space-y-4 bg-white p-6 rounded-3xl shadow-3xs border border-slate-100">
              <div className="flex gap-4 items-start text-xs md:text-sm">
                <div className="w-9 h-9 bg-[#64CCC5]/15 text-[#64CCC5] rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#2B3A4F]">Our Address</h4>
                  <p className="text-slate-500 mt-0.5">14 Rue de la Paix, 75002 Paris | Metro Opera (Lines 3, 7, 8)</p>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs md:text-sm">
                <div className="w-9 h-9 bg-[#EC8F5E]/15 text-[#EC8F5E] rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#2B3A4F]">Family Secretariat</h4>
                  <p className="text-slate-500 mt-0.5">+33 1 45 67 89 10 (Mon-Fri, 8:00 AM - 6:30 PM)</p>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs md:text-sm">
                <div className="w-9 h-9 bg-[#F3A3B0]/15 text-[#F3A3B0] rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#2B3A4F]">General Email</h4>
                  <p className="text-[#EC8F5E] mt-0.5 font-bold">admission@archedesanges.fr</p>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs md:text-sm">
                <div className="w-9 h-9 bg-[#8F80B3]/15 text-[#8F80B3] rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#2B3A4F]">Opening Hours</h4>
                  <p className="text-slate-500 mt-0.5">Children welcomed from 7:45 AM to 7:00 PM continuously.</p>
                </div>
              </div>
            </div>

            {/* Static Map with beautiful badge */}
            <div className="relative rounded-3xl overflow-hidden border-4 border-white bg-white shadow-md">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7w30N-vfOMMcci6aAhtlwEehrf40xc7GdtSf0JIHVnRxn-7TAsYOB6gxC1pOpStJlQ6muG3pvCctT3rwg1fDIeo3LI-hnFQCRMGsz5YqvRHy1AAkJIo7gsBP0R0naPu3CSCdGAy4N_2fB03JAyNYz_BtKVcJYmD5itKnnuq-AKtpOCGUvOPU_0O17iBOwgiE2meU15onHiFsIj2TPIrLBKHbRGs0qcjlEjF4QLbliyX9BtLvjlnXntGwKLZHV86mpE68r8DN2NYk" 
                alt="Nursery access map Paris 2" 
                className="w-full h-52 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-[#EC8F5E] text-white font-extrabold text-[10px] px-3 py-1 rounded-full shadow-lg border border-white uppercase">
                Elite Location Paris II
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Validation Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[36px] border border-slate-100 shadow-md space-y-6">
              <h3 className="text-xl font-extrabold text-[#2B3A4F] flex items-center gap-2">
                <span>Write to the Secretariat</span>
                <Sparkles className="w-5 h-5 text-[#FAF0E6] fill-[#EC8F5E]" />
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Parent's Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-3 outline-hidden transition-all text-[#2B3A4F]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. john.doe@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-3 outline-hidden transition-all text-[#2B3A4F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Phone (Optional)</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 555-1234"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-3 outline-hidden transition-all text-[#2B3A4F]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Subject of Your Message</label>
                    <select 
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-3 outline-hidden transition-all text-[#2B3A4F]"
                    >
                      <option>Request for a Private Visit</option>
                      <option>Questions about bilingualism</option>
                      <option>Technical enrollment issue</option>
                      <option>Other general questions</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Your Message *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="How can we best assist you?"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-3 outline-hidden transition-all text-[#2B3A4F] resize-none"
                  ></textarea>
                </div>

                {/* Validation feedbacks */}
                <AnimatePresence>
                  {formSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] rounded-xl flex items-start gap-2.5"
                    >
                      <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#047857]" />
                      <div>
                        <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                        <p className="text-xs text-[#047857] mt-1">
                          Our director <strong>Dr. Ross</strong> and the educational manager have received your request. We will send you a complete presentation file within 24 business hours.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  id="contact-form-submit"
                  type="submit"
                  className="w-full bg-[#EC8F5E] hover:bg-[#D37340] text-white font-bold p-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                  Send My Message
                </button>
              </form>
            </div>

            {/* Submission histories logs (Interactive localStorage trace) */}
            {messagesHistory.length > 0 && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[#2B3A4F] text-xs md:text-sm flex items-center gap-2">
                    <MessageSquare className="w-4.5 h-4.5 text-[#8F80B3]" />
                    Your messages sent on this device ({messagesHistory.length})
                  </h4>
                  <button 
                    onClick={handleClearHistory}
                    className="text-[10px] text-slate-400 font-bold hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear history
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {messagesHistory.map(msg => (
                    <div key={msg.id} className="bg-white p-3.5 rounded-xl border border-slate-200/60 text-xs shadow-3xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[#2B3A4F]">{msg.subject}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{msg.date}</span>
                      </div>
                      <p className="text-slate-500 italic font-medium">"{msg.message}"</p>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        Received - Processing within 24h by Dr. Ross
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ==================== LIGHTBOX POPUP ==================== */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2B3A4F]/90 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            key="lightbox-modal"
          >
            <div className="absolute inset-0" onClick={() => setLightboxPhoto(null)}></div>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden max-w-lg md:max-w-2xl w-full relative z-10 shadow-2xl border-4 border-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-4 right-4 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 p-2.5 rounded-full shadow-lg border border-slate-200 z-10 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo */}
              <img 
                src={lightboxPhoto.url} 
                alt={lightboxPhoto.title}
                className="w-full aspect-16/10 object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Descriptions body */}
              <div className="p-6 md:p-8 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="text-xl font-extrabold text-[#2B3A4F]">{lightboxPhoto.title}</h3>
                  <span className="bg-[#8F80B3]/15 text-[#8F80B3] text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {lightboxPhoto.ageGroup}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">{lightboxPhoto.description}</p>
                
                <div className="flex gap-2 items-center text-xs text-slate-400 font-bold pt-2">
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">100% Respectful</span>
                  <span>• Activity guided by the assigned supervisor</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
