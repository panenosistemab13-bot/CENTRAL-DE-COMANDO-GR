import React from 'react';
import PremiumBarChart, { BarKeyConfig } from './PremiumBarChart';
import PremiumLineChart, { LineKeyConfig } from './PremiumLineChart';
import PremiumDonutChart, { DonutDataConfig } from './PremiumDonutChart';

export interface PremiumChartProps {
  type: 'bar' | 'line' | 'donut';
  data: any[];
  xKey?: string;
  barKeys?: BarKeyConfig[];
  lineKeys?: LineKeyConfig[];
  donutData?: DonutDataConfig[];
  height?: number;
  title?: string;
  subtitle?: string;
  unit?: string;
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  className?: string;
}

export default function PremiumChart({
  type,
  data,
  xKey,
  barKeys,
  lineKeys,
  height = 200,
  title,
  subtitle,
  unit,
  centerLabel,
  centerValue,
  showLegend = true,
  className
}: PremiumChartProps) {
  if (type === 'bar') {
    return (
      <PremiumBarChart
        data={data}
        xKey={xKey}
        barKeys={barKeys || [{ key: 'value', name: 'Valor', color: '#9b1526' }]}
        height={height}
        title={title}
        subtitle={subtitle}
        unit={unit}
        className={className}
      />
    );
  }

  if (type === 'line') {
    return (
      <PremiumLineChart
        data={data}
        xKey={xKey}
        lines={lineKeys || [{ key: 'value', name: 'Valor', color: '#9b1526' }]}
        height={height}
        title={title}
        subtitle={subtitle}
        unit={unit}
        className={className}
      />
    );
  }

  if (type === 'donut') {
    const defaultDonutData = data.map((item, idx) => ({
      name: item.name || `Item ${idx}`,
      value: item.value || 0,
      color: item.color || (idx === 0 ? '#9b1526' : idx === 1 ? '#dfb15b' : idx === 2 ? '#10b981' : '#71717a')
    }));

    return (
      <PremiumDonutChart
        data={defaultDonutData}
        height={height}
        title={title}
        subtitle={subtitle}
        centerLabel={centerLabel}
        centerValue={centerValue}
        showLegend={showLegend}
        unit={unit}
        className={className}
      />
    );
  }

  return null;
}
