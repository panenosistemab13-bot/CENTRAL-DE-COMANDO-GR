import React from 'react';
import { GlassPanel3D } from './GlassPanel3D';
import { cn } from '../../lib/utils';

export interface Column3D<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTable3DProps<T> {
  columns: Column3D<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable3D<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Nenhum registro encontrado.",
  className,
  onRowClick
}: DataTable3DProps<T>) {
  return (
    <GlassPanel3D className={cn("overflow-hidden border border-slate-800/80", className)} variant="metallic">
      <div className="overflow-x-auto no-scrollbar w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sky-500/20 bg-slate-900/80 text-[10px] font-mono font-black uppercase tracking-wider text-sky-400">
              {columns.map((col) => (
                <th key={col.key} className={cn("py-3 px-4 font-mono", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs font-sans text-slate-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-500 font-mono text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={keyExtractor(item, idx)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    "transition-colors duration-150",
                    onRowClick ? "hover:bg-sky-500/10 cursor-pointer" : "hover:bg-slate-800/40",
                    idx % 2 === 0 ? "bg-slate-900/30" : "bg-transparent"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("py-3 px-4", col.className)}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassPanel3D>
  );
}
