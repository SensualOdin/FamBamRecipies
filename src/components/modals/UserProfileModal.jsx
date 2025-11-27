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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn">
      <div className={`bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'sm:scale-95 opacity-0 translate-y-4 sm:translate-y-0'}`}>
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />
        
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-4 sm:p-6 lg:p-8 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-cyan-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                setIsVisible(false);
                setTimeout(() => {
                  onSignOut();
                  onClose();
                }, 300);
              }
            }}
            className="absolute top-3 sm:top-6 left-3 sm:left-6 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/20 active:bg-white/30 sm:hover:bg-white/30 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 sm:hover:scale-105 z-10 font-medium text-xs sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden xs:inline">Sign Out</span>
          </button>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-3 sm:top-6 right-3 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 bg-white/20 active:bg-white/30 sm:hover:bg-white/30 rounded-full flex items-center justify-center transition-all active:scale-95 sm:hover:scale-110 z-10"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pt-8 sm:pt-0">
            {/* Avatar with Upload Option */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center text-4xl sm:text-6xl lg:text-7xl shadow-2xl overflow-hidden">
                {userProfile.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt={userProfile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userProfile.avatar
                )}
              </div>
              
              {/* Upload Overlay */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/50 rounded-2xl sm:rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-all cursor-pointer"
              >
                {isUploading ? (
                  <svg className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <div className="text-center text-white">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs font-medium">Change</span>
                  </div>
                )}
              </button>

              <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center gap-0.5 sm:gap-1">
                <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Lvl {userProfile.level}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left w-full">
              {isEditing ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-cyan-100 text-sm mb-1">Display Name</label>
                    <input
                      type="text"
                      value={editData.displayName}
                      onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:bg-white/30 focus:outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-100 text-sm mb-1">Bio</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:bg-white/30 focus:outline-none transition-all resize-none"
                      placeholder="Tell us about yourself..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-100 text-sm mb-2">Emoji Avatar (if no photo)</label>
                    <div className="flex flex-wrap gap-2">
                      {emojis.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setEditData(prev => ({ ...prev, avatar: emoji }))}
                          className={`w-10 h-10 text-2xl rounded-xl transition-all ${
                            editData.avatar === emoji 
                              ? 'bg-white/40 ring-2 ring-white scale-110' 
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          displayName: userProfile.name,
                          bio: userProfile.bio,
                          avatar: userProfile.avatar
                        });
                      }}
                      className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-cyan-50 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{userProfile.name}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 sm:p-2 bg-white/20 active:bg-white/30 sm:hover:bg-white/30 rounded-lg transition-all"
                      title="Edit Profile"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-cyan-100 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 line-clamp-2">{userProfile.bio}</p>
                  
                  {/* Level Progress Bar */}
                  <div className="bg-white/20 rounded-full p-0.5 sm:p-1 mb-2 sm:mb-3">
                    <div className="bg-white/90 rounded-full h-2 sm:h-3 transition-all duration-1000" style={{ width: `${levelProgress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-100">
                    <span>{userProfile.experience} / {userProfile.experienceToNextLevel} XP</span>
                    <span>{Math.round(levelProgress)}% to Lvl {userProfile.level + 1}</span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center">
                      <div className="text-lg sm:text-2xl lg:text-3xl font-bold">{userProfile.totalPoints}</div>
                      <div className="text-cyan-100 text-[9px] sm:text-xs">Points</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center">
                      <div className="text-lg sm:text-2xl lg:text-3xl font-bold">{userProfile.stats.recipesCooked}</div>
                      <div className="text-cyan-100 text-[9px] sm:text-xs">Cooked</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center">
                      <div className="text-lg sm:text-2xl lg:text-3xl font-bold">{userProfile.badges.length}</div>
                      <div className="text-cyan-100 text-[9px] sm:text-xs">Badges</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center">
                      <div className="text-lg sm:text-2xl lg:text-3xl font-bold">{userProfile.stats.longestStreak}</div>
                      <div className="text-cyan-100 text-[9px] sm:text-xs">Streak</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="px-3 sm:px-6 pt-3 sm:pt-4 pb-2 bg-gray-50 border-b overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 sm:gap-2 min-w-max">
            {['overview', 'achievements', 'recipes', 'favorites'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium capitalize transition-all text-xs sm:text-base whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 active:scale-95 sm:hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[40vh] sm:max-h-[50vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                {/* Stats Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
                  <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Statistics
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Recipes Created</span>
                      <span className="font-bold text-gray-800">{userProfile.stats.recipesCreated}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Comments Added</span>
                      <span className="font-bold text-gray-800">{userProfile.stats.commentsAdded}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Favorites</span>
                      <span className="font-bold text-gray-800">{userProfile.stats.favoritesCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Days Active</span>
                      <span className="font-bold text-gray-800">{userProfile.stats.daysActive}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-purple-200">
                  <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Recent Achievements
                  </h3>
                  <div className="space-y-2">
                    {userProfile.achievements.filter(a => a.unlocked).slice(0, 3).map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-2 sm:gap-3 p-2 bg-white rounded-lg">
                        <span className="text-2xl sm:text-3xl">{achievement.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{achievement.name}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {userProfile.achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`text-3xl sm:text-5xl shrink-0 ${!achievement.unlocked && 'grayscale opacity-40'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base">{achievement.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">{achievement.description}</p>
                      {achievement.unlocked ? (
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-blue-700">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">Unlocked {new Date(achievement.date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] sm:text-xs text-gray-400 italic">Locked</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div>
              {userRecipes.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-400">
                  <svg className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-base sm:text-lg mb-1 sm:mb-2">No recipes created yet</p>
                  <p className="text-xs sm:text-sm">Start adding your family recipes!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {userRecipes.map(recipe => (
                    <div key={recipe.id} className="p-3 sm:p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border-2 border-gray-200 active:border-blue-300 sm:hover:border-blue-300 sm:hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shrink-0">
                          {recipe.image && (recipe.image.startsWith('data:') || recipe.image.startsWith('http')) ? (
                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl sm:text-3xl">{recipe.image || '🍽️'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">{recipe.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">{recipe.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-600">
                        <span>⏱️ {recipe.cookTime}</span>
                        <span>👥 {recipe.servings}</span>
                        <span>🔥 {recipe.timesCooked || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              {favoriteRecipes.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-400">
                  <svg className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-base sm:text-lg mb-1 sm:mb-2">No favorite recipes yet</p>
                  <p className="text-xs sm:text-sm">Mark recipes you love with the ❤️ button!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {favoriteRecipes.map(recipe => (
                    <div key={recipe.id} className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl sm:rounded-2xl border-2 border-red-200 active:border-red-300 sm:hover:border-red-300 sm:hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center shrink-0">
                          {recipe.image && (recipe.image.startsWith('data:') || recipe.image.startsWith('http')) ? (
                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl sm:text-3xl">{recipe.image || '🍽️'}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">{recipe.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">by {recipe.author}</p>
                        </div>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-600">
                        <span>⏱️ {recipe.cookTime}</span>
                        <span>👥 {recipe.servings}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
