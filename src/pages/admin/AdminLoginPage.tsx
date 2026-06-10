import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth, ensureAdminOnFirstUser } from "@/auth/AuthContext";
import { useLang } from "@/i18n/LanguageContext";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  if (loading) return <p className="p-8 text-center">{t("loading")}</p>;
  if (user) return <Navigate to="/admin" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) {
      toast.error("Firebase not configured");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await ensureAdminOnFirstUser(cred.user.uid);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message ?? "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-bold mb-1">{mode === "signin" ? t("login") : t("signup")}</h1>
      <p className="text-xs text-muted-foreground mb-4">{t("firstUserAdmin")}</p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">{t("email")}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t("password")}</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-background" />
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-md py-2 font-medium disabled:opacity-50">
          {mode === "signin" ? t("login") : t("signup")}
        </button>
      </form>
      <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 text-sm text-muted-foreground underline w-full text-center">
        {mode === "signin" ? t("signup") : t("login")}
      </button>
    </div>
  );
}
