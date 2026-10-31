// Authentication & Session Management Utility

const CURRENT_USER_KEY = "daymark-current-user";

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function loginUser({ email, name, goal, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const derivedName = name?.trim() || cleanEmail.split("@")[0].replace(/[._-]/g, " ");

  const user = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
    goal: goal?.trim() || "Exams & Mastery",
    targetHours: 3.5,
    avatarColor: ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"][
      Math.floor(Math.random() * 5)
    ],
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
  // Purge any legacy saved-account or profiles keys from earlier sessions
  const legacyKeys = [
    "daymark-saved-accounts",
    "daymark-accounts",
    "daymark-recent-profiles",
    "daymark-profiles",
    "studyplanner-saved-users",
  ];
  legacyKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

export function updateUserProfile(updatedUser) {
  if (typeof window === "undefined") return updatedUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}
