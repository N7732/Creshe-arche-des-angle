import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Baby, Clock, CheckCircle, ShieldAlert, BadgeCheck, AlertCircle, Sparkles, 
  Trash2, User, ChevronRight, Play, RefreshCw, Calendar, ClipboardCheck, Award 
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function EnrollmentPortal() {
  const [enrollments, setEnrollments] = useState([]);
  
  // New Form Fields
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [ageGroup, setAgeGroup] = useState('baby');
  const [requestedStartDate, setRequestedStartDate] = useState('');
  const [scheduleDays, setScheduleDays] = useState(['Mon', 'Tue', 'Thu', 'Fri']);
  const [preferredClass, setPreferredClass] = useState('Mrs. Sarah Jenkins');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);

  const [enrollmentStatus, setEnrollmentStatus] = useState({ isOpen: true, loading: true });

  useEffect(() => {
    fetch('https://backend-creshe.onrender.com/api/enrollments/status')
      .then(res => res.json())
      .then(data => setEnrollmentStatus({ isOpen: data.isOpen, reason: data.reason, loading: false }))
      .catch(err => {
        console.error('Error fetching enrollment status', err);
        setEnrollmentStatus({ isOpen: true, loading: false }); // default open if error
      });

    const loaded = localStorage.getItem('creche_enrollments');
    if (loaded) {
      try {
        const parsed = JSON.parse(loaded);
        setEnrollments(parsed);
        if (parsed.length > 0) {
          setSelectedEnrollmentId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load local enrollments", e);
      }
    }
  }, []);

  const saveEnrollments = (updatedList) => {
    setEnrollments(updatedList);
    localStorage.setItem('creche_enrollments', JSON.stringify(updatedList));
  };

  const handleDayToggle = (day) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter(d => d !== day));
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  const handleNewSubmission = async (e) => {
    e.preventDefault();
    if (!childName || !childDob || !parentName || !parentEmail || !parentPhone) {
      return alert("Please fill in the mandatory child and parent information.");
    }
    if (scheduleDays.length === 0) {
      return alert("Please select at least one desired attendance day.");
    }

    const newEnrollment = {
      id: `enroll_${Date.now()}`,
      childName,
      childDob,
      ageGroup,
      requestedStartDate: requestedStartDate || new Date().toISOString().split('T')[0],
      scheduleDays,
      preferredClass,
      parentName,
      parentEmail,
      parentPhone,
      status: 'Submitted',
      specialNeeds,
      additionalNotes,
      submissionDate: new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      currentProgressCode: 0
    };

    try {
      const dbPayload = {
        id: newEnrollment.id,
        childName: childName,
        childDob: childDob,
        ageGroup: ageGroup,
        requestedStartDate: requestedStartDate || new Date().toISOString().split('T')[0],
        scheduleDays: scheduleDays,
        preferredClass: preferredClass,
        parentName: parentName,
        parentEmail: parentEmail,
        parentPhone: parentPhone,
        specialNeeds: specialNeeds || '',
        additionalNotes: additionalNotes || '',
        status: 'Submitted',
        currentProgressCode: 0,
        submissionDate: new Date().toLocaleDateString()
      };

      const res = await fetch('https://backend-creshe.onrender.com/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });
      
      if (!res.ok) {
        let errorMessage = 'An error occurred while submitting the form. Please try again.';
        try {
          const errData = await res.json();
          if (errData.error) errorMessage = errData.error;
        } catch(e) {
          const errText = await res.text();
          if (errText) errorMessage = errText;
        }
        throw new Error(errorMessage);
      }
      const savedData = await res.json();

      // Also save locally for the session view
      const newEnrollmentLocal = { ...newEnrollment, id: savedData.enrollmentId };
      const updated = [newEnrollmentLocal, ...enrollments];
      saveEnrollments(updated);
      setSelectedEnrollmentId(savedData.enrollmentId);

      // Reset Form fields
      setChildName('');
      setChildDob('');
      setAgeGroup('baby');
      setRequestedStartDate('');
      setSpecialNeeds('');
      setAdditionalNotes('');
      setFormSubmitted(true);

      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleIncrementProgress = (id) => {
    const list = enrollments.map(item => {
      if (item.id === id) {
        const nextProgress = Math.min(item.currentProgressCode + 1, 4);
        let updatedStatus = item.status;
        
        switch (nextProgress) {
          case 0: updatedStatus = 'Submitted'; break;
          case 1: updatedStatus = 'Reviewing'; break;
          case 2: updatedStatus = 'AvailabilityCheck'; break;
          case 3: updatedStatus = 'Approved'; break;
          case 4: updatedStatus = 'Offered'; break;
        }

        return {
          ...item,
          currentProgressCode: nextProgress,
          status: updatedStatus
        };
      }
      return item;
    });
    saveEnrollments(list);
  };

  const handleResetProgress = (id) => {
    const list = enrollments.map(item => {
      if (item.id === id) {
        return {
          ...item,
          currentProgressCode: 0,
          status: 'Submitted'
        };
      }
      return item;
    });
    saveEnrollments(list);
  };

  const handleDeleteEnrollment = (id) => {
    if (confirm("Do you want to permanently delete this local enrollment request?")) {
      const filtered = enrollments.filter(item => item.id !== id);
      saveEnrollments(filtered);
      if (selectedEnrollmentId === id) {
        setSelectedEnrollmentId(filtered.length > 0 ? filtered[0].id : null);
      }
    }
  };

  const selectedEnrollment = enrollments.find(e => e.id === selectedEnrollmentId);

  // Status mapping
  const PROGRESS_LINES = [
    { title: "File Registered", sub: "Administrative file received by the medical secretariat." },
    { title: "Health Validation", sub: "Pediatric PMI verification & Complex mandatory vaccines." },
    { title: "Attendance Schedule", sub: "Verification of occupancy rates according to the requested days." },
    { title: "Admission Committee", sub: "Final attribution validation by the director Dr. Ross." },
    { title: "Admission Offer Issued", sub: "Formal enrollment proposal ready to sign!" }
  ];

  const DAYS_DICT = {
    'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday'
  };

  return (
    <div className="pt-24 pb-12 space-y-12 bg-slate-50 dark:bg-slate-900 min-h-screen">
      
      {/* 1. Header description */}
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <span className="text-xs font-bold text-[#EC8F5E] uppercase tracking-wider">Interactive Admissions</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2B3A4F] dark:text-white">Enrollment & Tracking Portal</h1>
        <p className="text-black dark:text-slate-300 font-medium text-base md:text-lg leading-relaxed">
          To reassure every family, our nursery offers a transparent tool for tracking spot attribution. Fill out the admission form to simulate or submit a file in real-time.
        </p>
      </section>

      {/* 2. Main Centered Form */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col items-center">
        
        {/* Submit Enrollment Form */}
        <div className="w-full bg-white p-6 md:p-8 rounded-[36px] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-[#EC8F5E]/10 flex items-center justify-center shrink-0">
              <Baby className="w-5 h-5 text-[#EC8F5E]" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#2B3A4F]">New Admission Request</h2>
              <p className="text-[11px] text-slate-400">Fill in your household's needs to assess eligibility.</p>
            </div>
          </div>

          {enrollmentStatus.loading ? (
            <div className="p-12 flex justify-center text-[#EC8F5E]">Loading...</div>
          ) : !enrollmentStatus.isOpen ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-[#2B3A4F]">Enrollments Closed</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                {enrollmentStatus.reason === 'capacity' 
                  ? 'We have currently reached our maximum capacity for this period. Please check back later.' 
                  : 'Enrollments are currently paused by the administration. Please contact us for more information.'}
              </p>
            </div>
          ) : (
          <form onSubmit={handleNewSubmission} className="space-y-6 text-xs md:text-sm">
            
            {/* Child section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-[#8F80B3] tracking-widest flex items-center gap-1.5 border-b border-purple-50 pb-1">
                <span>1. Baby's Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Child's Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="First & Last name of the little angel"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-2.5 outline-hidden text-[#2B3A4F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Date of Birth (or expected) *</label>
                  <input 
                    type="date"
                    required
                    value={childDob}
                    onChange={e => setChildDob(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-2.5 outline-hidden text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Evolution Group (Section)</label>
                  <select
                    value={ageGroup}
                    onChange={e => setAgeGroup(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-2.5 outline-hidden text-[#2B3A4F]"
                  >
                    <option value="baby">Babies (10 weeks to 15 months)</option>
                    <option value="toddler">Toddlers (15 months to 24 months)</option>
                    <option value="preschool">Preschoolers (over 2 years)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Requested Start Date</label>
                  <input 
                    type="date"
                    value={requestedStartDate}
                    onChange={e => setRequestedStartDate(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-2.5 outline-hidden text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Attendance schedule section */}
            <div className="space-y-3">
              <label className="font-bold text-slate-700 flex justify-between items-center text-xs md:text-sm">
                <span>Desired Nursery Attendance (Check at least 1 day) *</span>
                <span className="text-slate-400 font-normal text-[11px]">Consecutive days recommended</span>
              </label>
              
              <div className="grid grid-cols-5 gap-2 text-center font-bold">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
                  const isChecked = scheduleDays.includes(day);
                  return (
                    <button
                      type="button"
                      id={`day-select-${day}`}
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-[#8F80B3] border-[#8F80B3] text-white shadow-xs' 
                          : 'bg-[#FDFBF7] border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] sm:text-xs">{DAYS_DICT[day]}</div>
                      <div className="text-[8px] tracking-wide font-black uppercase mt-1 opacity-75">{day}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parent section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-[#8F80B3] tracking-widest flex items-center gap-1.5 border-b border-purple-50 pb-1">
                <span>2. Contact Details</span>
              </h3>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Legal Guardian's Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    required
                    placeholder="Madam or Sir..."
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl pl-10 pr-4 py-2.5 outline-hidden text-[#2B3A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Primary Email *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="your.email@domain.com"
                    value={parentEmail}
                    onChange={e => setParentEmail(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-2.5 outline-hidden text-[#2B3A4F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Direct Mobile Phone *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. 555-0123"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-2.5 outline-hidden text-[#2B3A4F]"
                  />
                </div>
              </div>
            </div>

            {/* Medical context options */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-[#8F80B3] tracking-widest flex items-center gap-1.5 border-b border-purple-50 pb-1">
                <span>3. Medical & Educational Particularities (Optional)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Allergies or Medical Priorities</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Cow's Milk Protein Intolerance"
                    value={specialNeeds}
                    onChange={e => setSpecialNeeds(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-2.5 outline-hidden text-[#2B3A4F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Remarks (Departure time, nap etc.)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Leave at 5 PM every Tuesday"
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-slate-200 focus:border-[#EC8F5E] rounded-xl px-4 py-2.5 outline-hidden text-[#2B3A4F]"
                  />
                </div>
              </div>
            </div>

            {/* Form submit response toast */}
            <AnimatePresence>
              {formSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs flex items-start gap-2.5"
                >
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <h4 className="font-extrabold text-[#2B3A4F] text-sm">File Registered Locally!</h4>
                    <p className="mt-1 leading-relaxed">
                      The request for <strong>{childName || 'your child'}</strong> has been initialized. You can now follow the progress of their file in the right panel.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              id="enrollment-submit-btn"
              type="submit"
              className="w-full bg-[#EC8F5E] hover:bg-[#D37340] text-white font-bold p-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.1 active:scale-[0.99]"
            >
              Submit Admission File
            </button>
          </form>
          )}
        </div>



      </section>

    </div>
  );
}
