import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc, getDocs, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/firebase";

interface AuthCtx {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

/** Fake user object used when Firebase is not configured, so the admin UI can be previewed. */
const DEMO_USER = {
  uid: "demo-admin",
  email: "demo@preview.local",
  displayName: "Demo Admin",
} as unknown as User;

/** Ensure the first user who ever signs up is registered as an admin. */
export async function ensureAdminOnFirstUser(uid: string) {
  if (!db) return;
  const adminsRef = collection(db, "admins");
  const snap = await getDocs(adminsRef);
  if (snap.empty) {
    await setDoc(doc(db, "admins", uid), { createdAt: serverTimestamp() });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isDemo = !isFirebaseConfigured;
  const [user, setUser] = useState<User | null>(isDemo ? DEMO_USER : null);
  const [isAdmin, setIsAdmin] = useState(isDemo);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && db) {
        try {
          const adminDoc = await getDoc(doc(db, "admins", u.uid));
          setIsAdmin(adminDoc.exists());
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signOut = async () => {
    if (auth) await fbSignOut(auth);
  };

  return <Ctx.Provider value={{ user, isAdmin, loading, isDemo, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

