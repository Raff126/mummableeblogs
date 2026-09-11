export type UserRole = 'Admin' | 'Assistant';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Suspended';
  createdAt: string;
  lastLogin?: string;
  authMethod: 'google' | 'password' | 'both';
  passwordHash?: string; // Stored password or hash for email/password credentials
}

export interface CurrentSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authMethod: 'google' | 'password';
  token?: string;
}

export const USER_STORAGE_KEYS = {
  USERS: 'mummabee_users',
  CURRENT_USER: 'mummabee_current_user',
};

// Seed Users: Only Donne (Mumma Bee) remains as the primary administrator
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin-donne',
    name: 'Donne (Mumma Bee)',
    email: 'donne@mummabeeblog.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-08-01T00:00:00Z',
    lastLogin: '2026-09-06T12:37:00Z',
    authMethod: 'both',
    passwordHash: 'MummaBee2026!',
  },
  {
    id: 'usr-assistant-demo',
    name: 'Editorial Assistant',
    email: 'assistant@mummabeeblog.com',
    role: 'Assistant',
    status: 'Active',
    createdAt: '2026-08-01T00:00:00Z',
    lastLogin: '2026-09-06T12:37:00Z',
    authMethod: 'password',
    passwordHash: 'Assistant2026!',
  },
];

// Read user list from localStorage with fallback to default seed
export function getUsersList(): UserAccount[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Migrate any Artist to Assistant
        const filtered = parsed
          .map((u: UserAccount) => {
            if ((u.role as any) === 'Artist') {
              return { ...u, role: 'Assistant' as UserRole };
            }
            return u;
          })
          .filter((u: UserAccount) => u?.email && typeof u.email === 'string');

        // Ensure Donne is always present
        const hasDonne = filtered.some(
          (u: UserAccount) => u.email?.trim().toLowerCase() === 'donne@mummabeeblog.com'
        );

        let finalUsers = filtered;
        if (!hasDonne) {
          finalUsers = [DEFAULT_USERS[0], ...filtered];
        }

        if (finalUsers.length !== parsed.length || !hasDonne) {
          localStorage.setItem(USER_STORAGE_KEYS.USERS, JSON.stringify(finalUsers));
        }
        return finalUsers;
      }
    }
  } catch (_) {}

  // Seed defaults if nothing stored
  try {
    localStorage.setItem(USER_STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  } catch (_) {}
  return DEFAULT_USERS;
}

// Save user list to localStorage and trigger sync event
export function saveUsersList(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('mummabee_users_updated', { detail: users }));

    // Persist to Cloud Firestore in the background
    import('../utils/firestoreSettings')
      .then(({ saveUsersToFirestore }) => {
        saveUsersToFirestore(users).catch((err) => {
          console.warn('Background saveUsersToFirestore failed:', err);
        });
      })
      .catch(() => {});
  } catch (err) {
    console.error('Failed to save users list:', err);
  }
}

// Pull latest user accounts from Cloud Firestore and merge into localStorage
export async function syncUsersFromFirestore(): Promise<UserAccount[]> {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const { fetchUsersFromFirestore } = await import('../utils/firestoreSettings');
    const remoteUsers = await fetchUsersFromFirestore();
    if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
      const localUsers = getUsersList();
      const userMap = new Map<string, UserAccount>();

      // Seed Donne first
      userMap.set('donne@mummabeeblog.com', DEFAULT_USERS[0]);

      // Add local users
      for (const u of localUsers) {
        if (u && u.email) {
          userMap.set(u.email.trim().toLowerCase(), u);
        }
      }

      // Merge remote users
      for (const ru of remoteUsers) {
        if (ru && ru.email) {
          const cleanEmail = ru.email.trim().toLowerCase();
          const existing = userMap.get(cleanEmail);
          if (!existing) {
            userMap.set(cleanEmail, ru);
          } else {
            userMap.set(cleanEmail, {
              ...existing,
              ...ru,
              passwordHash: ru.passwordHash || existing.passwordHash,
            });
          }
        }
      }

      const merged = Array.from(userMap.values());
      localStorage.setItem(USER_STORAGE_KEYS.USERS, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('mummabee_users_updated', { detail: merged }));
      return merged;
    }
  } catch (err) {
    console.warn('Error syncing users from Firestore:', err);
  }
  return getUsersList();
}

// Find user by email (case-insensitive)
export function findUserByEmail(email: string): UserAccount | undefined {
  const users = getUsersList();
  const cleanEmail = email.trim().toLowerCase();
  return users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
}

// Resolve user role for an email address
export function resolveRoleForEmail(email: string): UserRole {
  const user = findUserByEmail(email);
  if (user) return user.role;

  const clean = email.trim().toLowerCase();
  if (clean === 'donne@mummabeeblog.com') {
    return 'Admin';
  }
  return 'Assistant';
}

// Current Session User helpers
export function getCurrentUser(): CurrentSessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
        return parsed as CurrentSessionUser;
    }
  } catch (_) {}

  // If authenticated via mummabee_auth but no current_user record, default to Donne
  const isAuth = localStorage.getItem('mummabee_auth') === 'true';
  if (isAuth) {
    const defaultSession: CurrentSessionUser = {
      id: 'usr-admin-donne',
      name: 'Donne (Mumma Bee)',
      email: 'donne@mummabeeblog.com',
      role: 'Admin',
      authMethod: 'password',
    };
    setCurrentUser(defaultSession);
    return defaultSession;
  }

  return null;
}

export function getCurrentUserRole(): UserRole | null {
  const user = getCurrentUser();
  return user ? user.role : null;
}

export function setCurrentUser(user: CurrentSessionUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('mummabee_current_user_changed', { detail: user }));
    } else {
      localStorage.removeItem(USER_STORAGE_KEYS.CURRENT_USER);
      window.dispatchEvent(new CustomEvent('mummabee_current_user_changed', { detail: null }));
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
}

// Permission checking helpers
export function isAdmin(): boolean {
  const role = getCurrentUserRole();
  return role === 'Admin';
}

export function isAssistant(): boolean {
  const role = getCurrentUserRole();
  return role === 'Assistant';
}

export function hasAdminAccess(): boolean {
  return isAdmin();
}

// Admin-only User CRUD operations
export function createUser(userData: {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  authMethod?: 'google' | 'password' | 'both';
}): { success: boolean; user?: UserAccount; error?: string } {
  if (!isAdmin()) {
    return { success: false, error: 'Access Denied: Only Administrators can create new users.' };
  }

  const cleanEmail = userData.email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  if (!userData.password || userData.password.trim().length < 6) {
    return { success: false, error: 'Password is required and must be at least 6 characters.' };
  }

  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    return { success: false, error: `A user with email "${cleanEmail}" already exists.` };
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: userData.name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    role: userData.role,
    status: 'Active',
    createdAt: new Date().toISOString(),
    authMethod: userData.authMethod || 'password',
    passwordHash: userData.password.trim(),
  };

  const users = getUsersList();
  const updated = [...users, newUser];
  saveUsersList(updated);

  return { success: true, user: newUser };
}

export function updateUser(
  id: string,
  updates: Partial<Pick<UserAccount, 'name' | 'role' | 'status' | 'passwordHash'>>
): { success: boolean; user?: UserAccount; error?: string } {
  if (!isAdmin()) {
    return { success: false, error: 'Access Denied: Only Administrators can modify users.' };
  }

  const users = getUsersList();
  const target = users.find((u) => u.id === id);
  if (!target) {
    return { success: false, error: 'User not found.' };
  }

  // Prevent demoting the last active administrator
  if (updates.role && updates.role !== 'Admin' && target.role === 'Admin') {
    const otherActiveAdmins = users.filter((u) => u.id !== id && u.role === 'Admin' && u.status === 'Active');
    if (otherActiveAdmins.length === 0) {
      return { success: false, error: 'Cannot change role: You must maintain at least one active Administrator.' };
    }
  }

  const updatedUsers = users.map((u) => {
    if (u.id === id) {
      return { ...u, ...updates };
    }
    return u;
  });

  saveUsersList(updatedUsers);
  const updatedUser = updatedUsers.find((u) => u.id === id);

  // If modifying current session user, update session
  const current = getCurrentUser();
  if (current && current.id === id) {
    setCurrentUser({
      ...current,
      name: updates.name || current.name,
      role: updates.role || current.role,
    });
  }

  return { success: true, user: updatedUser };
}

export function deleteUser(id: string): { success: boolean; error?: string } {
  if (!isAdmin()) {
    return { success: false, error: 'Access Denied: Only Administrators can delete users.' };
  }

  const users = getUsersList();
  const target = users.find((u) => u.id === id);
  if (!target) {
    return { success: false, error: 'User not found.' };
  }

  // Prevent deleting the last active administrator
  if (target.role === 'Admin') {
    const otherActiveAdmins = users.filter((u) => u.id !== id && u.role === 'Admin' && u.status === 'Active');
    if (otherActiveAdmins.length === 0) {
      return { success: false, error: 'Cannot delete: You must keep at least one active Administrator (donne@mummabeeblog.com).' };
    }
  }

  const updated = users.filter((u) => u.id !== id);
  saveUsersList(updated);

  return { success: true };
}

export function resetUserPassword(id: string, newPassword: string): { success: boolean; error?: string } {
  if (!isAdmin()) {
    return { success: false, error: 'Access Denied: Only Administrators can reset passwords.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  return updateUser(id, { passwordHash: newPassword });
}

// Verify credentials for local email/password login
export function verifyCredentials(
  emailInput: string,
  passwordInput: string
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();
  const users = getUsersList();

  const user = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email.' };
  }

  if (user.status === 'Suspended') {
    return { success: false, error: 'This account has been suspended. Please contact the Administrator.' };
  }

  // Check stored password
  if (user.passwordHash && user.passwordHash === cleanPass) {
    // Record last login
    user.lastLogin = new Date().toISOString();
    saveUsersList(users);

    return { success: true, user };
  }

  // Default fallback password for demo Donne or Assistant
  if (
    (cleanEmail === 'assistant@mummabeeblog.com' && cleanPass === 'Assistant2026!') ||
    (cleanEmail === 'donne@mummabeeblog.com' && cleanPass === 'MummaBee2026!')
  ) {
    user.lastLogin = new Date().toISOString();
    saveUsersList(users);
    return { success: true, user };
  }

  return { success: false, error: 'Incorrect password for this account.' };
}
