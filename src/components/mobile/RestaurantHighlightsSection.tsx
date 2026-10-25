import React from 'react';
import { SignatureDish } from '../../types';
import { Sparkles, Utensils } from 'lucide-react';

interface RestaurantHighlightsSectionProps {
  dishes?: SignatureDish[];
  cuisine: string;
}

export const RestaurantHighlightsSection: React.FC<RestaurantHighlightsSectionProps> = ({
  dishes = [],
  cuisine,
}) => {
  if (!dishes || dishes.length === 0) return null;

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Utensils className="w-4 h-4 text-[#002b49]" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
            Signature Dishes & Highlights
          </h4>
        </div>
        <span className="text-[11px] text-amber-700 font-medium">Chef's Selection</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {dishes.map((dish) => (
          <div
            key={dish.id}
            className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl border border-neutral-200/80 transition-all flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-neutral-900">{dish.name}</span>
                {dish.isChefRecommendation && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    Must Try
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-600 leading-snug">{dish.description}</p>
            </div>

            <div className="shrink-0 text-right">
              <span className="font-mono font-bold text-xs text-neutral-900">
                ${dish.priceUSD.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
