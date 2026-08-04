import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { getCurrentUser, ensureUserProfile, getUserProfileWithStats, onAuthStateChange, recordUserActivity, signOut as supabaseSignOut, supabase } from '../lib/supabase';
import { initialUserProfile } from '../data/initialProfile';
import { User, UserProfile } from '../types';

export const useAuth = () => {
  const setUser = useStore((state) => state.setUser);
  const setUserProfile = useStore((state) => state.setUserProfile);
  const user = useStore((state) => state.user);
  const setModal = useStore((state) => state.setModal);
  const setAuthMode = useStore((state) => state.setAuthMode);
  const queryClient = useQueryClient();
  const isRecoveryFlow = useRef(false);

  // Fetch profile with stats using React Query
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => (user ? getUserProfileWithStats(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  // Sync profile data to store when Query data changes
  // Use user?.id (primitive) instead of user (object) to avoid infinite re-render loop
  const userId = user?.id;
  useEffect(() => {
    if (profileQuery.data && userId) {
      const profileWithStats = profileQuery.data;
      setUserProfile((prev: UserProfile) => ({
        ...prev,
        name: profileWithStats.display_name || 'Chef',
        avatar: profileWithStats.avatar || '👨‍🍳',
        avatarUrl: profileWithStats.avatar_url || undefined,
        bio: profileWithStats.bio || 'Passionate home cook keeping family traditions alive',
        level: profileWithStats.level || 1,
        experience: profileWithStats.experience || 0,
        experienceToNextLevel: profileWithStats.experience_to_next_level || 100,
        totalPoints: profileWithStats.total_points || 0,
        badges: profileWithStats.badges || [],
        achievements: initialUserProfile.achievements.map(ach => ({
          ...ach,
          unlocked: profileWithStats.badges?.includes(ach.id) || false
        })),
        stats: {
          recipesCooked: profileWithStats.stats?.recipesCooked || 0,
          recipesCreated: profileWithStats.stats?.recipesCreated || 0,
          commentsAdded: profileWithStats.stats?.commentsAdded || 0,
          favoritesCount: profileWithStats.stats?.favoritesCount || 0,
          daysActive: profileWithStats.stats?.daysActive || 1,
          longestStreak: profileWithStats.stats?.longestStreak || 0
        }
      }));

      setUser((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          display_name: profileWithStats.display_name,
          avatar: profileWithStats.avatar,
          avatar_url: profileWithStats.avatar_url,
          bio: profileWithStats.bio
        };
      });
    }
  }, [profileQuery.data, userId, setUser, setUserProfile]);

  // Handle PKCE code exchange from password reset and email confirm redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const isReset = params.get('reset') === '1';

    if (code) {
      if (isReset) {
        isRecoveryFlow.current = true;
      }
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('Code exchange failed:', error);
        }
        // Clean the URL
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser({ id: currentUser.id, email: currentUser.email! });
        await recordUserActivity(currentUser.id, 'login');
      }
    };

    checkSession();

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        isRecoveryFlow.current = true;
        setUser({ id: session.user.id, email: session.user.email! });
        setAuthMode('reset');
        setModal('auth', true);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        // If this SIGNED_IN came from a password recovery flow, show reset modal instead of closing
        if (isRecoveryFlow.current) {
          isRecoveryFlow.current = false;
          setAuthMode('reset');
          setModal('auth', true);
        } else {
          setModal('auth', false);
        }
        queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(initialUserProfile as UserProfile);
        setModal('profile', false);
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setUserProfile, setModal, setAuthMode, queryClient]);

  const signOut = async () => {
    await supabaseSignOut();
  };

  return {
    user,
    signOut,
    isLoading: profileQuery.isLoading && !!user
  };
};
