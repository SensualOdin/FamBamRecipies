import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LogOut, Edit2, Camera, Trophy, 
  BookOpen, Heart, Activity, ChevronRight,
  Star, Clock, Flame
} from 'lucide-react';
import { uploadAvatar, updateUserProfile } from '../../lib/supabase';

const UserProfileModal = ({ onClose, userProfile, recipes, onSignOut, user, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userProfile.name,
    bio: userProfile.bio,
    avatar: userProfile.avatar
  });
  const fileInputRef = useRef(null);

  const emojis = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨', '👩', '🧑', '👴', '👵', '🧓', '👦', '👧', '🧒', '😊', '😎', '🤠', '🥳', '🍳', '🍽️'];

  useEffect(() => {
    setEditData({
      displayName: userProfile.name,
      bio: userProfile.bio,
      avatar: userProfile.avatar
    });
  }, [userProfile]);

  const userRecipes = recipes.filter(r => r.author === userProfile.name);
  const favoriteRecipes = recipes.filter(r => r.isFavorite);

  const levelProgress = (userProfile.experience / userProfile.experienceToNextLevel) * 100;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const { avatarUrl, error } = await uploadAvatar(user.id, file);
      if (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar. Please try again.');
      } else if (avatarUrl && onProfileUpdate) {
        onProfileUpdate({ avatarUrl });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      const { error } = await updateUserProfile(user.id, editData);
      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      } else if (onProfileUpdate) {
        onProfileUpdate({
          name: editData.displayName,
          bio: editData.bio,
          avatar: editData.avatar
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 150 || velocity.y > 500) {
              onClose();
            }
          }}
          className="bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden shrink-0">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Header with gradient background */}
            <div className="relative bg-slate-950 p-8 sm:p-12 text-white overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-detroit-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
              </div>

              <div className="relative z-10">
                {/* Top Navigation */}
                <div className="flex justify-between items-start mb-8 sm:mb-12">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to sign out?')) {
                        onSignOut();
                        onClose();
                      }
                    }}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-2 transition-all border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-widest"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </motion.button>

                  <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all border border-white/10">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-8 sm:gap-10">
                  {/* Avatar Section */}
                  <div className="relative group shrink-0">
                    <div className="w-32 h-32 sm:w-44 sm:h-44 bg-white rounded-[32px] sm:rounded-[48px] flex items-center justify-center text-6xl sm:text-7xl shadow-2xl overflow-hidden ring-4 ring-white/10">
                      {userProfile.avatarUrl ? (
                        <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                      ) : (
                        userProfile.avatar
                      )}
                    </div>
                    
                    {/* Upload Trigger */}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/60 rounded-[32px] sm:rounded-[48px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                    >
                      {isUploading ? (
                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-white mb-2" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center px-4">Update Photo</span>
                        </>
                      )}
                    </button>

                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-detroit-500 text-white px-5 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-detroit-500/30 whitespace-nowrap">
                      Lvl {userProfile.level} Chef
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 text-center md:text-left w-full pt-4">
                    {isEditing ? (
                      <div className="space-y-4 animate-fadeIn">
                        <input
                          type="text"
                          value={editData.displayName}
                          onChange={(e) => setEditData(p => ({ ...p, displayName: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-white placeholder-slate-500 outline-none focus:bg-white/20 transition-all"
                          placeholder="Display Name"
                        />
                        <textarea
                          value={editData.bio}
                          onChange={(e) => setEditData(p => ({ ...p, bio: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-white placeholder-slate-500 outline-none focus:bg-white/20 transition-all resize-none"
                          placeholder="Your bio..."
                          rows={2}
                        />
                        <div className="flex gap-3">
                          <button onClick={handleSaveProfile} className="flex-1 sm:flex-none bg-white text-slate-950 px-8 py-2.5 rounded-2xl font-bold hover:bg-slate-100 transition-all text-sm">Save</button>
                          <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none bg-white/10 text-white px-8 py-2.5 rounded-2xl font-bold hover:bg-white/20 transition-all text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-fadeIn">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{userProfile.name}</h2>
                          <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                          </button>
                        </div>
                        <p className="text-slate-400 text-base sm:text-xl font-medium mb-8 max-w-xl">{userProfile.bio}</p>
                        
                        {/* XP Progress */}
                        <div className="max-w-md mx-auto md:mx-0">
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Mastery Progress</span>
                            <span className="text-xs font-black text-detroit-400">{userProfile.experience} <span className="text-slate-600">/ {userProfile.experienceToNextLevel} XP</span></span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${levelProgress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-detroit-600 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(14,145,233,0.3)]" 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Navigation */}
            <div className="bg-white px-6 sm:px-8 pt-4 border-b sticky top-0 z-20">
              <div className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
                  { id: 'achievements', label: 'Badges', icon: <Trophy className="w-4 h-4" /> },
                  { id: 'recipes', label: 'Created', icon: <BookOpen className="w-4 h-4" /> },
                  { id: 'favorites', label: 'Saved', icon: <Heart className="w-4 h-4" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-detroit-500 rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Panels */}
            <div className="p-6 sm:p-8 pb-20">
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total Points', value: userProfile.totalPoints, color: 'bg-amber-50 text-amber-600', icon: <Star className="w-6 h-6" /> },
                      { label: 'Recipes Cooked', value: userProfile.stats.recipesCooked, color: 'bg-emerald-50 text-emerald-600', icon: <Flame className="w-6 h-6" /> },
                      { label: 'Traditions Kept', value: userProfile.stats.recipesCreated, color: 'bg-detroit-50 text-detroit-600', icon: <BookOpen className="w-6 h-6" /> },
                      { label: 'Cook Streak', value: userProfile.stats.longestStreak, color: 'bg-rose-50 text-rose-600', icon: <Activity className="w-6 h-6" /> }
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className={`${stat.color} rounded-[28px] sm:rounded-[32px] p-6 flex flex-col items-center justify-center text-center transition-all shadow-sm`}
                      >
                        <div className="mb-2 opacity-80">{stat.icon}</div>
                        <span className="text-2xl sm:text-3xl font-black mb-1">{stat.value}</span>
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60">{stat.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="bg-slate-50 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Recent Badges</h3>
                    <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                      {userProfile.achievements.filter(a => a.unlocked).slice(0, 4).map(a => (
                        <div key={a.id} className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl shadow-sm hover:scale-110 transition-transform cursor-help" title={a.name}>
                          {a.icon}
                        </div>
                      ))}
                      {userProfile.achievements.filter(a => a.unlocked).length === 0 && (
                        <p className="text-slate-400 text-[10px] text-center italic uppercase tracking-wider font-bold">No badges earned yet</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {userProfile.achievements.map(a => (
                    <div key={a.id} className={`p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] border-2 transition-all flex gap-4 sm:gap-6 ${a.unlocked ? 'bg-white border-detroit-100 shadow-xl shadow-detroit-500/5' : 'bg-slate-50 border-transparent opacity-60 grayscale'}`}>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shrink-0">
                        {a.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">{a.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{a.description}</p>
                        {a.unlocked && (
                          <div className="mt-3 text-[9px] font-black text-detroit-500 uppercase tracking-widest">
                            Unlocked {new Date(a.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'recipes' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {userRecipes.map(r => (
                    <div key={r.id} className="group p-4 bg-white border border-slate-100 rounded-[24px] sm:rounded-[28px] hover:border-detroit-200 transition-all flex gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden shrink-0">
                        {r.image && (r.image.startsWith('data:') || r.image.startsWith('http')) ? (
                          <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl">{r.image || '🥘'}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-bold text-slate-900 mb-1 truncate group-hover:text-detroit-600 transition-colors text-sm sm:text-base">{r.title}</h4>
                        <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-widest font-bold">{r.category}</p>
                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                          <span className="bg-slate-50 px-2 py-0.5 rounded-md flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {r.cookTime}</span>
                          <span className="bg-slate-50 px-2 py-0.5 rounded-md flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> {r.timesCooked || 0} cooks</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {userRecipes.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-[32px]">
                      <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">No recipes created yet</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'favorites' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {favoriteRecipes.map(r => (
                    <div key={r.id} className="group p-4 bg-white border border-slate-100 rounded-[24px] sm:rounded-[28px] hover:border-rose-100 transition-all flex gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-xl sm:rounded-2xl overflow-hidden shrink-0">
                        {r.image && (r.image.startsWith('data:') || r.image.startsWith('http')) ? (
                          <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl">{r.image || '🥘'}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 mb-1 truncate group-hover:text-rose-500 transition-colors text-sm sm:text-base">{r.title}</h4>
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                        </div>
                        <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-widest font-bold">by {r.author}</p>
                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                          <span className="bg-rose-50/50 text-rose-600 px-2 py-0.5 rounded-md flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {r.cookTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {favoriteRecipes.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-[32px]">
                      <Heart className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">No favorites saved yet</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfileModal;
