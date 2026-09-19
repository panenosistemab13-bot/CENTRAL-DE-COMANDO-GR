import React from 'react';
import { cn } from '../../lib/utils';
import { Clock, CheckCircle, AlertCircle, Circle } from 'lucide-react';

export interface TimelineItem3D {
  id: string;
  time: string;
  title: string;
  description?: string;
  status?: 'completed' | 'current' | 'pending' | 'alert';
}

interface Timeline3DProps {
  items: TimelineItem3D[];
  className?: string;
}

export function Timeline3D({ items, className }: Timeline3DProps) {
  return (
    <div className={cn("relative flex flex-col gap-4 pl-4 border-l-2 border-slate-800", className)}>
      {items.map((item, idx) => {
        const isCompleted = item.status === 'completed';
        const isCurrent = item.status === 'current';
        const isAlert = item.status === 'alert';

        return (
          <div key={item.id || idx} className="relative flex flex-col gap-1 pl-4 group">
            {/* Timeline Node Icon */}
            <div className={cn(
              "absolute -left-[25px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-slate-900 transition-all",
              isCompleted && "border-emerald-500 text-emerald-400 shadow-[0_0_8px_#10b981]",
              isCurrent && "border-sky-400 text-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]",
              isAlert && "border-rose-500 text-rose-400 shadow-[0_0_8px_#ef4444]",
              !item.status && "border-slate-600 text-slate-500"
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>

            {/* Time & Title */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-sky-400/90 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                {item.time}
              </span>
              <h5 className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                {item.title}
              </h5>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-xs font-sans text-slate-400 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
