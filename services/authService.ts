
import { supabase } from './supabaseClient';
import { User } from '../types';

export const authService = {
  // Register a new user
  register: async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { success: false, message: error.message };
      if (data.user) {
        return { 
          success: true, 
          user: { id: data.user.id, email: data.user.email, username: data.user.email?.split('@')[0] } 
        };
      }
      return { success: false, message: 'Unknown error' };
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  },

  // Login
  login: async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, message: 'invalidCredentials' }; // Map to translation key
      if (data.user) {
         return { 
          success: true, 
          user: { id: data.user.id, email: data.user.email, username: data.user.email?.split('@')[0] } 
        };
      }
      return { success: false, message: 'Unknown error' };
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  },

  // Logout
  logout: async () => {
    await supabase.auth.signOut();
  },

  // Get current session
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return { 
        id: session.user.id, 
        email: session.user.email,
        username: session.user.email?.split('@')[0]
      };
    }
    return null;
  }
};
