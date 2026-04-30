'use client';

import { useTenant } from '@/hooks/useTenant';
import { Check } from 'lucide-react';
import { PLANS } from '@/lib/constants/plans';

export default function BillingPage() {
  const { tenant } = useTenant();
  const currentPlan = tenant?.plan === 'pro' ? PLANS.pro : PLANS.basic;

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your subscription</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Current Plan</h2>
            <p className="text-sm text-zinc-500 mt-0.5">{currentPlan.name} — ${currentPlan.priceMonthly}/month</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            tenant?.subscriptionStatus === 'active'
              ? 'bg-green-50 text-green-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {tenant?.subscriptionStatus ?? 'unknown'}
          </span>
        </div>

        <ul className="space-y-2">
          {currentPlan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
              <Check className="w-4 h-4 text-zinc-400" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="font-semibold mb-2">Need to change plans?</h3>
        <p className="text-sm text-zinc-500">
          Contact us at{' '}
          <a href="mailto:supportdesk@nofabusinessconsulting.com" className="text-zinc-900 font-medium hover:underline">
            supportdesk@nofabusinessconsulting.com
          </a>{' '}
          to upgrade, downgrade, or cancel your subscription.
        </p>
      </div>
    </div>
  );
}
