import React, { useState, useEffect } from 'react';

const UserProfileModal = ({ onClose, userProfile, recipes }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const userRecipes = recipes.filter(r => r.author === userProfile.name);
  const favoriteRecipes = recipes.filter(r => r.isFavorite);

  const levelProgress = (userProfile.experience / userProfile.experienceToNextLevel) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-8 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-7xl shadow-2xl">
                {userProfile.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Lvl {userProfile.level}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2">{userProfile.name}</h2>
              <p className="text-cyan-100 text-lg mb-4">{userProfile.bio}</p>
              
              {/* Level Progress Bar */}
              <div className="bg-white/20 rounded-full p-1 mb-3">
                <div className="bg-white/90 rounded-full h-3 transition-all duration-1000" style={{ width: `${levelProgress}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm text-cyan-100">
                <span>{userProfile.experience} / {userProfile.experienceToNextLevel} XP</span>
                <span>{Math.round(levelProgress)}% to Level {userProfile.level + 1}</span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="text-3xl font-bold">{userProfile.totalPoints}</div>
                  <div className="text-cyan-100 text-xs">Total Points</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="text-3xl font-bold">{userProfile.stats.recipesCooked}</div>
                  <div className="text-cyan-100 text-xs">Recipes Cooked</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="text-3xl font-bold">{userProfile.badges.length}</div>
                  <div className="text-cyan-100 text-xs">Badges</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <div className="text-3xl font-bold">{userProfile.stats.longestStreak}</div>
                  <div className="text-cyan-100 text-xs">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-2 bg-gray-50 border-b">
          <div className="flex gap-2">
            {['overview', 'achievements', 'recipes', 'favorites'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Stats Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Statistics
                  </h3>
                  <div className="space-y-3">
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
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Recent Achievements
                  </h3>
                  <div className="space-y-2">
                    {userProfile.achievements.filter(a => a.unlocked).slice(0, 3).map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                        <span className="text-3xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm">{achievement.name}</div>
                          <div className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</div>
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
            <div className="grid grid-cols-2 gap-4">
              {userProfile.achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-5xl ${!achievement.unlocked && 'grayscale opacity-40'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      {achievement.unlocked ? (
                        <div className="flex items-center gap-2 text-xs text-amber-700">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Unlocked {new Date(achievement.date).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">Locked</div>
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
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-lg mb-2">No recipes created yet</p>
                  <p className="text-sm">Start adding your family recipes!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {userRecipes.map(recipe => (
                    <div key={recipe.id} className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{recipe.image}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{recipe.title}</h4>
                          <p className="text-sm text-gray-500">{recipe.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>⏱️ {recipe.cookTime}</span>
                        <span>👥 {recipe.servings}</span>
                        <span>🔥 {recipe.timesCooked || 0} cooks</span>
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
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-lg mb-2">No favorite recipes yet</p>
                  <p className="text-sm">Mark recipes you love with the ❤️ button!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {favoriteRecipes.map(recipe => (
                    <div key={recipe.id} className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 hover:border-red-300 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{recipe.image}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{recipe.title}</h4>
                          <p className="text-sm text-gray-500">by {recipe.author}</p>
                        </div>
                        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
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

