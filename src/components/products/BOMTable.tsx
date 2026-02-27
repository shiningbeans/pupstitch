'use client';

import { BOMItem } from '@/types/product-types';

interface BOMTableProps { items: BOMItem[]; }

export default function BOMTable({ items }: BOMTableProps) {
  const grouped = items.reduce<Record<string, BOMItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalCost = items.reduce((sum, item) => sum + (item.estimatedCostUSD || 0) * item.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Bill of Materials</h3>
        <span className="text-sm font-semibold text-[var(--success)] bg-[var(--success)]/10 px-3 py-1 rounded">
          Est. ${totalCost.toFixed(2)}
        </span>
      </div>
      <div className="space-y-3">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{category}</p>
            <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200">
              {categoryItems.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900 font-medium">{item.name}</p>
                    {item.specification && <p className="text-xs text-slate-500 mt-0.5">{item.specification}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm text-slate-700">{item.quantity} {item.unit}</p>
                    {item.estimatedCostUSD !== undefined && <p className="text-xs text-slate-400">${(item.estimatedCostUSD * item.quantity).toFixed(2)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
