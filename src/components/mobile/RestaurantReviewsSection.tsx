import React, { useState } from 'react';
import { RestaurantReview } from '../../types';
import { Star, ShieldCheck, ThumbsUp, MessageSquare } from 'lucide-react';

interface RestaurantReviewsSectionProps {
  rating: number;
  reviewCount: number;
  reviews?: RestaurantReview[];
  ratingBreakdown?: {
    food: number;
    service: number;
    ambience: number;
    value: number;
  };
}

export const RestaurantReviewsSection: React.FC<RestaurantReviewsSectionProps> = ({
  rating,
  reviewCount,
  reviews = [],
  ratingBreakdown = { food: 4.9, service: 4.8, ambience: 4.9, value: 4.7 },
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const filterTags = ['ALL', 'Food', 'Ambience', 'Service'];

  const filteredReviews = reviews.filter((r) => {
    if (selectedTag === 'ALL') return true;
    return r.tag === selectedTag;
  });

  return (
    <div className="space-y-3 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-[#002b49]" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
            Diner Ratings & Reviews
          </h4>
        </div>
        <span className="text-[11px] text-neutral-500 font-medium">
          {reviewCount} verified reviews
        </span>
      </div>

      {/* Rating Score & 4-Dimension Breakdown Card */}
      <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/90 flex flex-col sm:flex-row items-center gap-4">
        {/* Big Score Box */}
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs min-w-[100px] w-full sm:w-auto text-center">
          <span className="text-3xl font-black font-serif text-neutral-900 leading-none">
            {rating.toFixed(2)}
          </span>
          <div className="flex items-center gap-0.5 text-amber-400 my-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i <= Math.round(rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-neutral-200 text-neutral-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-neutral-500">
            Out of 5.0
          </span>
        </div>

        {/* Categories Bar Breakdown */}
        <div className="flex-1 w-full space-y-2">
          {[
            { label: 'Food & Flavor', score: ratingBreakdown.food },
            { label: 'Ambience & Setting', score: ratingBreakdown.ambience },
            { label: 'Service & Hospitality', score: ratingBreakdown.service },
            { label: 'Value & Portion', score: ratingBreakdown.value },
          ].map((cat) => (
            <div key={cat.label} className="space-y-0.5">
              <div className="flex justify-between text-[11px] font-medium text-neutral-700">
                <span>{cat.label}</span>
                <span className="font-bold font-mono text-neutral-900">{cat.score.toFixed(1)}</span>
              </div>
              <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#002b49] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(cat.score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified ABA Customer Guarantee Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          100% verified reviews from customers with completed dining reservations.
        </span>
      </div>

      {/* Filter Chips */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#002b49] text-white shadow-2xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {tag === 'ALL' ? 'All Reviews' : tag}
            </button>
          ))}
        </div>
      )}

      {/* Review List */}
      <div className="space-y-2.5">
        {filteredReviews.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
            No reviews match this category filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-neutral-100 text-[#002b49] font-bold text-xs flex items-center justify-center border border-neutral-200">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-neutral-900">{rev.authorName}</span>
                      {rev.verifiedCustomer && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                          Verified ABA Diner
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 block">{rev.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-900">{rev.rating}</span>
                </div>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed italic">
                "{rev.comment}"
              </p>

              {rev.dishRecommended && (
                <div className="flex items-center gap-1 text-[10px] text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-100 w-fit">
                  <ThumbsUp className="w-3 h-3 text-amber-600" />
                  <span>
                    Recommended:{' '}
                    <strong className="text-neutral-900">{rev.dishRecommended}</strong>
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
