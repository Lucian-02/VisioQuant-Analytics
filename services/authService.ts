import { User } from '../types';

const USERS_KEY = 'neurometric_users';
const SESSION_KEY = 'neurometric_session';

export const authService = {
  // Get all registered users
  getUsers: (): User[] => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  // Register a new user
  register: (username: string, password: string): { success: boolean; message?: string; user?: User } => {
    const users = authService.getUsers();
    
    if (users.some(u => u.username === username)) {
      return { success: false, message: 'usernameExists' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      password,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return { success: true, user: newUser };
  },

  // Login
  login: (username: string, password: string): { success: boolean; message?: string; user?: User } => {
    const users = authService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return { success: false, message: 'invalidCredentials' };
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // Get current session
  getCurrentUser: (): User | null => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }
};