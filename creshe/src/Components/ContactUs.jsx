import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const res = await fetch('https://backend-creshe.onrender.com/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!res.ok) throw new Error('Failed to send message');

        setIsSubmitted(true);
        setFormData({ parentName: '', email: '', phone: '', subject: '', message: '' });
      } catch (error) {
        console.error('Contact error:', error);
        alert('An error occurred while sending your message. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-blue-900/25 dark:bg-slate-800">
      
      {/* Header */}
      <section className="text-center space-y-2 max-w-3xl mx-auto px-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white">Contact Us</h1>
        <p className="text-black dark:text-slate-400 font-medium text-lg leading-relaxed">
          We are always happy to hear from parents. Whether you have a question or want to schedule a visit, we are here for you.
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 bg-white dark:bg-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
          
          {/* LEFT SIDE: Contact Details & Map */}
          <div className="w-full lg:w-5/12 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center shrink-0 text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Address</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">14 Rue de la Paix, 75002 Paris, France</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-slate-700 flex items-center justify-center shrink-0 text-secondary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Phone</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">+33 1 45 67 89 10</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-slate-700 flex items-center justify-center shrink-0 text-accent-pink">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Email</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">admission@archedesanges.fr</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-slate-700 flex items-center justify-center shrink-0 text-accent-green">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Working Hours</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Mon - Fri: 7:30 AM - 6:30 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-800/50 flex items-center justify-center shrink-0 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-red-700 dark:text-red-400">Emergency Contact</h4>
                  <p className="text-red-600 dark:text-red-300 font-medium mt-1">+33 1 45 67 89 99</p>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
              <iframe 
                title="Google Map Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.582857434525!2d2.32973161567439!3d48.8661647792881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e30129bcce3%3A0x6b87d605278c2e64!2sRue%20de%20la%20Paix%2C%2075002%20Paris%2C%20France!5e0!3m2!1sen!2sus!4v1689100000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* RIGHT SIDE: Contact Form */}
          <div className="w-full lg:w-7/12 bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-10 rounded-[2rem] border border-slate-100 dark:border-slate-700">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">Message Sent!</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Thank you for reaching out to CRÈCHE ARCHE DES ANGES de Bugesera. We will get back to you as soon as possible.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-full font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-8">Send Us a Message</h3>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Parent Name</label>
                  <input 
                    type="text" 
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border ${errors.parentName ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-primary focus:border-primary'} focus:outline-hidden focus:ring-2 transition-all dark:text-white shadow-sm`}
                    placeholder="Enter your full name"
                  />
                  {errors.parentName && <p className="text-red-500 text-xs font-bold mt-1">{errors.parentName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-primary focus:border-primary'} focus:outline-hidden focus:ring-2 transition-all dark:text-white shadow-sm`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-primary focus:border-primary'} focus:outline-hidden focus:ring-2 transition-all dark:text-white shadow-sm`}
                      placeholder="+33 1 23 45 67 89"
                    />
                    {errors.phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                  <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-primary focus:border-primary'} focus:outline-hidden focus:ring-2 transition-all dark:text-white shadow-sm`}
                    placeholder="E.g., Enrollment Inquiry 2026"
                  />
                  {errors.subject && <p className="text-red-500 text-xs font-bold mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-primary focus:border-primary'} focus:outline-hidden focus:ring-2 transition-all dark:text-white shadow-sm resize-none`}
                    placeholder="How can we help you?"
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs font-bold mt-1">{errors.message}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg"
                >
                  <Send className="w-5 h-5" /> Send Message
                </motion.button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
