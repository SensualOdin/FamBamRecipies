import React, { useState, useEffect, useRef } from 'react';
import { uploadAvatar, updateUserProfile } from '../../lib/supabase';

const UserProfileModal = ({ onClose, userProfile, recipes, onSignOut, user, onProfileUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);
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
    setTimeout(() => setIsVisible(true), 50);
  }, []);

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
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${isVisible ? 'bg-slate-900/60 backdrop-blur-md' : 'bg-transparent'}`} onClick={onClose}>
      <div 
        className={`bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-hide transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'sm:scale-95 opacity-0 translate-y-32'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="relative bg-slate-950 p-8 sm:p-12 text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-detroit-600/20 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10">
            {/* Top Navigation */}
            <div className="flex justify-between items-start mb-12">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    onSignOut();
                    onClose();
                  }
                }}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-2 transition-all border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>

              <button onClick={onClose} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all border border-white/10">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
              {/* Avatar Section */}
              <div className="relative group shrink-0">
                <div className="w-32 h-32 sm:w-44 sm:h-44 bg-white rounded-[32px] sm:rounded-[48px] flex items-center justify-center text-7xl shadow-2xl overflow-hidden ring-4 ring-white/10">
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
                      <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Update Photo</span>
                    </>
                  )}
                </button>

                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-detroit-500 text-white px-6 py-2 rounded-2xl font-black text-sm shadow-xl shadow-detroit-500/30 whitespace-nowrap">
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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white placeholder-slate-500 outline-none focus:bg-white/10 transition-all"
                      placeholder="Display Name"
                    />
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData(p => ({ ...p, bio: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white placeholder-slate-500 outline-none focus:bg-white/10 transition-all resize-none"
                      placeholder="Your bio..."
                      rows={2}
                    />
                    <div className="flex gap-3">
                      <button onClick={handleSaveProfile} className="bg-white text-slate-950 px-8 py-2.5 rounded-2xl font-bold hover:bg-slate-100 transition-all">Save Changes</button>
                      <button onClick={() => setIsEditing(false)} className="bg-white/10 text-white px-8 py-2.5 rounded-2xl font-bold hover:bg-white/20 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                      <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{userProfile.name}</h2>
                      <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </div>
                    <p className="text-slate-400 text-lg sm:text-xl font-medium mb-8 max-w-xl">{userProfile.bio}</p>
                    
                    {/* XP Progress */}
                    <div className="max-w-md">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Mastery Progress</span>
                        <span className="text-sm font-black text-detroit-400">{userProfile.experience} <span className="text-slate-600">/ {userProfile.experienceToNextLevel} XP</span></span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <div className="h-full bg-gradient-to-r from-detroit-600 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(14,145,233,0.3)]" style={{ width: `${levelProgress}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Navigation */}
        <div className="bg-slate-50 px-8 pt-4 border-b sticky top-0 z-20">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'achievements', label: 'Achievements' },
              { id: 'recipes', label: 'My Recipes' },
              { id: 'favorites', label: 'Favorites' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-detroit-500 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panels */}
        <div className="p-8 pb-20">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Points', value: userProfile.totalPoints, color: 'bg-amber-50 text-amber-600', icon: '💎' },
                  { label: 'Recipes Cooked', value: userProfile.stats.recipesCooked, color: 'bg-emerald-50 text-emerald-600', icon: '🔥' },
                  { label: 'Traditions Kept', value: userProfile.stats.recipesCreated, color: 'bg-detroit-50 text-detroit-600', icon: '📖' },
                  { label: 'Cook Streak', value: userProfile.stats.longestStreak, color: 'bg-rose-50 text-rose-600', icon: '⚡' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.color} rounded-[32px] p-6 flex flex-col items-center justify-center text-center group transition-all hover:scale-105`}>
                    <span className="text-3xl mb-2">{stat.icon}</span>
                    <span className="text-3xl font-black mb-1">{stat.value}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{stat.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-slate-50 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Recent Badges</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  {userProfile.achievements.filter(a => a.unlocked).slice(0, 4).map(a => (
                    <div key={a.id} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm hover:scale-110 transition-transform cursor-help" title={a.name}>
                      {a.icon}
                    </div>
                  ))}
                  {userProfile.achievements.filter(a => a.unlocked).length === 0 && (
                    <p className="text-slate-400 text-xs text-center italic">No badges earned yet. Keep cooking!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {userProfile.achievements.map(a => (
                <div key={a.id} className={`p-6 rounded-[32px] border-2 transition-all flex gap-6 ${a.unlocked ? 'bg-white border-detroit-100 shadow-xl shadow-detroit-500/5' : 'bg-slate-50 border-transparent opacity-60 grayscale'}`}>
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shrink-0">
                    {a.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{a.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{a.description}</p>
                    {a.unlocked && (
                      <div className="mt-3 text-[10px] font-black text-detroit-500 uppercase tracking-widest">
                        Unlocked {new Date(a.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recipes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {userRecipes.map(r => (
                <div key={r.id} className="group p-4 bg-white border border-slate-100 rounded-[28px] hover:border-detroit-200 transition-all flex gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                    {r.image && (r.image.startsWith('data:') || r.image.startsWith('http')) ? (
                      <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">{r.image || '🥘'}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h4 className="font-bold text-slate-900 mb-1 truncate group-hover:text-detroit-600 transition-colors">{r.title}</h4>
                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest font-bold">{r.category}</p>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      <span className="bg-slate-50 px-2 py-0.5 rounded-md">⏱️ {r.cookTime}</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded-md">🔥 {r.timesCooked || 0} cooks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {favoriteRecipes.map(r => (
                <div key={r.id} className="group p-4 bg-white border border-slate-100 rounded-[28px] hover:border-rose-100 transition-all flex gap-4">
                  <div className="w-20 h-20 bg-rose-50 rounded-2xl overflow-hidden shrink-0">
                    {r.image && (r.image.startsWith('data:') || r.image.startsWith('http')) ? (
                      <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">{r.image || '🥘'}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 mb-1 truncate group-hover:text-rose-500 transition-colors">{r.title}</h4>
                      <span className="text-rose-500">❤️</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest font-bold">by {r.author}</p>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      <span className="bg-rose-50/50 text-rose-600 px-2 py-0.5 rounded-md">⏱️ {r.cookTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
