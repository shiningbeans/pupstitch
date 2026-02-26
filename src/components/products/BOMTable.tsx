'use client';

import { BOMItem } from '@/types/product-types';

interface BOMTableProps {
  items: BOMItem[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  fabric: '🧵',
  hardware: '🔩',
  thread: '🪡',
  notions: '📌',
  packaging: '📦',
};

export default function BOMTable({ items }: BOMTableProps) {
  // Group by category
  const grouped = items.reduce<Record<string, BOMItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalCost = items.reduce((sum, item) => sum + (item.estimatedCostUSD || 0) * item.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-amber-900">Bill of Materials</h3>
        <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
          Est. ${totalCost.toFixed(2)}
        </span>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category}>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              {CATEGORY_EMOJIS[category] || '📋'} {category}
            </p>
            <div className="bg-amber-50 rounded-xl border border-amber-100 divide-y divide-amber-100">
              {categoryItems.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-amber-900 font-medium">{item.name}</p>
                    {item.specification && (
                      <p className="text-xs text-amber-600 mt-0.5">{item.specification}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm text-amber-800">
                      {item.quantity} {item.unit}
                    </p>
                    {item.estimatedCostUSD !== undefined && (
                      <p className="text-xs text-amber-500">
                        ${(item.estimatedCostUSD * item.quantity).toFixed(2)}
                      </p>
                    )}
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
