'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: number;
  format: string;
  trend: string;
  trendType: string;
  description: string;
  sparklineData: number[];
  color: string;
}

const KPICard = ({
  title,
  value,
  format,
  trend,
  trendType,
  description,
  sparklineData,
  color,
}: KPICardProps) => {
  const formattedValue = () => {
    if (format === 'numero') {
      return value?.toLocaleString?.('pt-BR') ?? '0';
    } else if (format === 'percentual') {
      return `${value?.toFixed?.(2) ?? '0'}%`;
    } else if (format === 'decimal') {
      return value?.toFixed?.(2) ?? '0';
    }
    return value?.toString?.() ?? '0';
  };

  const chartData = sparklineData?.map?.((val, idx) => ({
    index: idx,
    value: val ?? 0,
  })) ?? [];

  const isPositive = trendType === 'aumento';

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Title */}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {title}
        </p>

        {/* Value */}
        <h3 className="text-3xl font-bold text-gray-900 mb-4">{formattedValue()}</h3>

        {/* Trend */}
        <div className="flex items-center gap-2 mb-4">
          {isPositive ? (
            <ArrowUp className="w-4 h-4 text-red-500" />
          ) : (
            <ArrowDown className="w-4 h-4 text-green-500" />
          )}
          <span
            className={`text-sm font-medium ${
              isPositive ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {trend}
          </span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-16" style={{ backgroundColor: `${color}08` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`${color}40`}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default KPICard;
