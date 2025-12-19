import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LogOut, Edit2, Camera, Trophy, 
  BookOpen, Heart, Activity,
  Clock, Flame, Check, ChevronRight
} from 'lucide-react';
import { uploadAvatar, updateUserProfile } from '../../lib/supabase';
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const UserProfileModal = ({ onClose, userProfile, recipes, onSignOut, user, onProfileUpdate }) => {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editData, setEditData] = useState({
    displayName: userProfile.name,
    bio: userProfile.bio,
    avatar: userProfile.avatar
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditData({
      displayName: userProfile.name,
      bio: userProfile.bio,
      avatar: userProfile.avatar
    });
  }, [userProfile]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setOpen(false);
      setTimeout(onClose, 300);
    }
  };

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden border-none rounded-t-[40px] sm:rounded-[48px] shadow-2xl flex flex-col gap-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
          {/* Header with gradient background */}
          <div className="relative bg-slate-950 p-8 sm:p-12 text-white overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-detroit-600/20 rounded-full blur-[120px]" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
              {/* Top Navigation */}
              <div className="flex justify-between items-start mb-8 sm:mb-12">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to sign out?')) {
                      onSignOut();
                      handleOpenChange(false);
                    }
                  }}
                  className="px-5 h-10 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-2 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenChange(false)}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10"
                >
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-end gap-8 sm:gap-10">
                {/* Avatar Section */}
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 sm:w-44 sm:h-44 bg-white rounded-[32px] sm:rounded-[48px] flex items-center justify-center text-6xl sm:text-7xl shadow-2xl overflow-hidden ring-4 ring-white/10">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage src={userProfile.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-white rounded-none text-6xl sm:text-7xl">
                        {userProfile.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Upload Trigger */}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <Button
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/60 rounded-[32px] sm:rounded-[48px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm h-full w-full"
                  >
                    {isUploading ? (
                      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-white mb-2" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center px-4">Update Photo</span>
                      </>
                    )}
                  </Button>

                  <Badge className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-detroit-500 text-white px-5 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-detroit-500/30 whitespace-nowrap border-none">
                    Lvl {userProfile.level} Chef
                  </Badge>
                </div>

                {/* Profile Details */}
                <div className="flex-1 text-center md:text-left w-full pt-4">
                  {isEditing ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <Input
                        value={editData.displayName}
                        onChange={(e) => setEditData(p => ({ ...p, displayName: e.target.value }))}
                        className="w-full bg-white/10 border-white/20 rounded-2xl px-6 h-12 text-white placeholder:text-slate-500 focus-visible:ring-detroit-500"
                        placeholder="Display Name"
                      />
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData(p => ({ ...p, bio: e.target.value }))}
                        className="w-full bg-white/10 border-white/20 rounded-2xl px-6 py-3 text-white placeholder:text-slate-500 focus-visible:ring-detroit-500 resize-none min-h-[80px]"
                        placeholder="Your bio..."
                      />
                      <div className="flex gap-3">
                        <Button onClick={handleSaveProfile} className="flex-1 sm:flex-none bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold h-10 px-8 text-sm">Save</Button>
                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none bg-white/10 text-white hover:bg-white/20 rounded-2xl font-bold h-10 px-8 text-sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{userProfile.name}</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10">
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                      <p className="text-slate-400 text-base sm:text-xl font-medium mb-8 max-w-xl">{userProfile.bio}</p>
                      
                      {/* XP Progress */}
                      <div className="max-w-md mx-auto md:mx-0">
                        <div className="flex justify-between items-end mb-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Mastery Progress</span>
                          <span className="text-xs font-black text-detroit-400">{userProfile.experience} <span className="text-slate-600">/ {userProfile.experienceToNextLevel} XP</span></span>
                        </div>
                        <Progress value={levelProgress} className="h-2.5 bg-white/5 p-0.5" indicatorClassName="bg-gradient-to-r from-detroit-600 to-cyan-400 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white px-6 sm:px-8 pt-4 border-b sticky top-0 z-20">
              <TabsList className="bg-transparent h-auto p-0 gap-6 sm:gap-8 overflow-x-auto scrollbar-hide justify-start">
                {[
                  { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
                  { id: 'achievements', label: 'Badges', icon: <Trophy className="w-4 h-4" /> },
                  { id: 'recipes', label: 'Created', icon: <BookOpen className="w-4 h-4" /> },
                  { id: 'favorites', label: 'Saved', icon: <Heart className="w-4 h-4" /> }
                ].map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative flex items-center gap-2 whitespace-nowrap border-none bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none text-slate-400 hover:text-slate-600 rounded-none h-auto p-0"
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-1 bg-detroit-500 rounded-full" />}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Panels */}
            <div className="p-6 sm:p-8 pb-20">
              <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 text-center sm:text-left">Recent Badges</h3>
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
              </TabsContent>

              <TabsContent value="achievements" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
              </TabsContent>

              <TabsContent value="recipes" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {userRecipes.map(r => (
                  <div key={r.id} className="group p-4 bg-white border border-slate-100 rounded-[24px] sm:rounded-[28px] hover:border-detroit-200 transition-all flex gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden shrink-0">
                      <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={r.image && (r.image.startsWith('http') || r.image.startsWith('data:')) ? r.image : undefined} className="object-cover" />
                        <AvatarFallback className="bg-slate-50 rounded-none text-2xl sm:text-3xl">
                          {r.image || '🥘'}
                        </AvatarFallback>
                      </Avatar>
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
              </TabsContent>

              <TabsContent value="favorites" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {favoriteRecipes.map(r => (
                  <div key={r.id} className="group p-4 bg-white border border-slate-100 rounded-[24px] sm:rounded-[28px] hover:border-rose-100 transition-all flex gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-xl sm:rounded-2xl overflow-hidden shrink-0">
                      <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={r.image && (r.image.startsWith('http') || r.image.startsWith('data:')) ? r.image : undefined} className="object-cover" />
                        <AvatarFallback className="bg-rose-50 rounded-none text-2xl sm:text-3xl">
                          {r.image || '🥘'}
                        </AvatarFallback>
                      </Avatar>
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
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
