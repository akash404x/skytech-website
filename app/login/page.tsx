'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

function authErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'auth/invalid-credential') return 'Invalid email or password';
  if (code === 'auth/user-not-found') return 'User not found';
  if (code === 'auth/wrong-password') return 'Wrong password';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
  return 'Unable to sign in. Please try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      toast.success('Signed in successfully');
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google');
      router.push('/');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="tech-auth-page">
      <div className="tech-auth-card">
        <div className="text-center">
          <Link href="/" className="text-4xl font-bold italic text-white">
            Sky<span className="text-blue-400">Tech</span>
          </Link>
          <h1 className="tech-heading mt-6 text-2xl">Welcome Back</h1>
          <p className="mt-2 text-sm tech-muted">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="tech-input block w-full py-3 pl-10 pr-3"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="tech-input block w-full py-3 pl-10 pr-3"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="tech-btn-primary flex w-full items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>

          <div className="relative tech-divider">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2">Or continue with</span>
            </div>
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="tech-btn-secondary disabled:cursor-not-allowed">
            Sign in with Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm tech-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="tech-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
