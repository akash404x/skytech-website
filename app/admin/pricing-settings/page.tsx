'use client';

import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { DollarSign, Truck, Package, Save, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import type { GSTSettings, ShippingSettings, DeliverySettings } from '@/lib/types';

export default function PricingSettingsPage() {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [gstSettings, setGstSettings] = useState<GSTSettings>({ enabled: true, percentage: 18 });
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({ shippingFee: 80, freeShippingAbove: 999 });
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({ enabled: true, charge: 20 });
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/access-denied';
      return;
    }

    if (!user) return;

    let loaded = 0;

    // Load GST settings
    const unsubscribeGST = onSnapshot(doc(db, 'settings', 'gst'), (doc) => {
      if (doc.exists()) {
        setGstSettings(doc.data() as GSTSettings);
      }
      loaded++;
      setLoadedCount(loaded);
      if (loaded >= 3) setLoading(false);
    }, (error) => {
      console.error('Error loading GST settings:', error);
      loaded++;
      setLoadedCount(loaded);
      if (loaded >= 3) setLoading(false);
    });

    // Load Shipping settings
    const unsubscribeShipping = onSnapshot(doc(db, 'settings', 'shipping'), (doc) => {
      if (doc.exists()) {
        setShippingSettings(doc.data() as ShippingSettings);
      }
      loaded++;
      setLoadedCount(loaded);
      if (loaded >= 3) setLoading(false);
    });

    // Load Delivery settings
    const unsubscribeDelivery = onSnapshot(doc(db, 'settings', 'delivery'), (doc) => {
      if (doc.exists()) {
        setDeliverySettings(doc.data() as DeliverySettings);
      }
      loaded++;
      setLoadedCount(loaded);
      if (loaded >= 3) setLoading(false);
    });

    // Fallback: if settings don't exist after 2 seconds, stop loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Settings not found in Firestore, using defaults');
        setLoading(false);
      }
    }, 2000);

    return () => {
      unsubscribeGST();
      unsubscribeShipping();
      unsubscribeDelivery();
      clearTimeout(timeout);
    };
  }, [user, authLoading, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getIdToken();
      
      // Save GST settings
      const gstResponse = await fetch('/api/admin/settings/gst', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(gstSettings),
      });
      const gstData = await gstResponse.json();
      if (!gstResponse.ok) throw new Error(gstData.error || 'Failed to save GST settings');

      // Save Shipping settings
      const shippingResponse = await fetch('/api/admin/settings/shipping', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(shippingSettings),
      });
      const shippingData = await shippingResponse.json();
      if (!shippingResponse.ok) throw new Error(shippingData.error || 'Failed to save shipping settings');

      // Save Delivery settings
      const deliveryResponse = await fetch('/api/admin/settings/delivery', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(deliverySettings),
      });
      const deliveryData = await deliveryResponse.json();
      if (!deliveryResponse.ok) throw new Error(deliveryData.error || 'Failed to save delivery settings');

      toast.success('Pricing settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    try {
      const token = await getIdToken();
      const response = await fetch('/api/admin/settings/init', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to initialize settings');
      toast.success('Settings initialized successfully');
    } catch (error) {
      console.error('Error initializing settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initialize settings');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="tech-loading-screen">
        <div className="tech-spinner" />
      </div>
    );
  }

  return (
    <div className="tech-page flex min-h-screen flex-col">
      <Navbar />
      <main className="tech-main">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="tech-heading-gradient text-3xl font-bold">Pricing Settings</h1>
            <p className="mt-2 tech-text">
              {loadedCount < 3 ? 'Loading settings...' : 'Manage GST, shipping, and delivery charges'}
            </p>
          </div>
          <button
            onClick={handleInitialize}
            className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <RefreshCw className="h-4 w-4" />
            Initialize Settings
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* GST Settings */}
          <section className="tech-glass-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-green-600/30 p-3 text-green-300">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">GST Settings</h2>
                <p className="text-sm tech-muted">Configure GST percentage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Enable GST</label>
                <select
                  value={gstSettings.enabled.toString()}
                  onChange={(e) => setGstSettings({ ...gstSettings, enabled: e.target.value === 'true' })}
                  className="tech-input w-full cursor-pointer bg-slate-800/50 border border-slate-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">GST Percentage (%)</label>
                <input
                  type="number"
                  value={gstSettings.percentage}
                  onChange={(e) => setGstSettings({ ...gstSettings, percentage: parseFloat(e.target.value) || 0 })}
                  className="tech-input w-full bg-slate-800/50 border border-slate-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="0"
                  max="100"
                  step="1"
                />
                <p className="mt-1 text-xs tech-muted">Common values: 0%, 5%, 12%, 18%, 28%</p>
              </div>
            </div>
          </section>

          {/* Shipping Settings */}
          <section className="tech-glass-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-600/30 p-3 text-blue-300">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Shipping Settings</h2>
                <p className="text-sm tech-muted">Configure shipping fees</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Shipping Fee (₹)</label>
                <input
                  type="number"
                  value={shippingSettings.shippingFee}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, shippingFee: parseFloat(e.target.value) || 0 })}
                  className="tech-input w-full bg-slate-800/50 border border-slate-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Free Shipping Above (₹)</label>
                <input
                  type="number"
                  value={shippingSettings.freeShippingAbove}
                  onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingAbove: parseFloat(e.target.value) || 0 })}
                  className="tech-input w-full bg-slate-800/50 border border-slate-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="0"
                  step="1"
                />
                <p className="mt-1 text-xs tech-muted">Orders above this amount get free shipping</p>
              </div>
            </div>
          </section>

          {/* Delivery Settings */}
          <section className="tech-glass-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-purple-600/30 p-3 text-purple-300">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delivery Settings</h2>
                <p className="text-sm tech-muted">Configure delivery charges</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Enable Delivery Charge</label>
                <select
                  value={deliverySettings.enabled.toString()}
                  onChange={(e) => setDeliverySettings({ ...deliverySettings, enabled: e.target.value === 'true' })}
                  className="tech-input w-full cursor-pointer bg-slate-800/50 border border-slate-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Delivery Charge (₹)</label>
                <input
                  type="number"
                  value={deliverySettings.charge}
                  onChange={(e) => setDeliverySettings({ ...deliverySettings, charge: parseFloat(e.target.value) || 0 })}
                  className="tech-input w-full bg-slate-800/50 border border-slate-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="0"
                  step="1"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="tech-btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
