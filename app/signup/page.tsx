'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

function authErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'auth/email-already-in-use') return 'Email already in use';
  if (code === 'auth/invalid-email') return 'Invalid email address';
  if (code === 'auth/weak-password') return 'Password is too weak';
  return 'Unable to create account. Please try again.';
}

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name);
      toast.success('Account created');
      router.push('/');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google');
      router.push('/');
    } catch (error) {
      console.error('Google signup error:', error);
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
          <h1 className="tech-heading mt-6 text-2xl">Create Account</h1>
          <p className="mt-2 text-sm tech-muted">Join SkyTech and start shopping</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="tech-input block w-full py-3 pl-10 pr-3"
                  placeholder="Your name"
                />
              </div>
            </div>

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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="tech-input block w-full py-3 pl-10 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
                  className="tech-input block w-full py-3 pl-10 pr-3"
                  placeholder="Repeat your password"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="tech-btn-primary flex w-full items-center justify-center text-sm disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>

          <button type="button" onClick={handleGoogleSignup} disabled={loading} className="tech-btn-secondary disabled:cursor-not-allowed">
            Sign up with Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm tech-muted">
          Already have an account?{' '}
          <Link href="/login" className="tech-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
