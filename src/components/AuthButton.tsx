"use client";
import { useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      alert("Google Sign-In failed");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading) return <div>Loading...</div>;

  return user ? (
    <div>
      <span>Welcome, {user.displayName || user.email}!</span>
      <button onClick={handleSignOut} style={{ marginLeft: 8 }}>Sign out</button>
    </div>
  ) : (
    <button onClick={handleSignIn}>Sign in with Google</button>
  );
}
