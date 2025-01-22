import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button"

interface PriceHistoryProps {
  priceHistory: { date: string; price: number }[];
  selectedTimeFrame: string;
  selectedGrade?: string;
}

const GRADE_COLORS = {
  'Ungraded': '#0088FE',
  'PSA 7': '#00C49F',
  'PSA 8': '#FFBB28',
  'PSA 9': '#FF8042',
  'BGS 9.5': '#8884D8',
  'PSA 10': '#FF0000',
};

const PriceHistoryChart: React.FC<PriceHistoryProps> = ({ priceHistory, selectedTimeFrame, selectedGrade = 'Ungraded' }) => {
  // const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');

  const filterDataByTimeFrame = (data: { date: string; price: number }[]) => {
    const now = new Date();
    const timeFrameMap: { [key: string]: number } = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12,
      'ALL': 0
    };

    if (selectedTimeFrame === 'ALL') return data;

    const months = timeFrameMap[selectedTimeFrame] || 1;
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - months);

    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredData = filterDataByTimeFrame(priceHistory);

  const getYAxisDomain = (data: { price: number }[]) => {
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        {(['1M', '3M', '6M', '1Y', 'ALL'] as string[]).map((frame) => (
          <Button
            key={frame}
            variant={selectedTimeFrame === frame ? "default" : "outline"}
            size="sm"
            onClick={() => {}} //onClick={() => setTimeFrame(frame)}
            className={`${
              selectedTimeFrame === frame 
                ? 'bg-[#18BFBF] text-[#0F2F2F]' 
                : 'bg-[rgba(24,191,191,0.1)] text-[#00FFFF] hover:bg-[rgba(24,191,191,0.2)]'
            }`}
          >
            {frame}
          </Button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={filteredData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(24,191,191,0.2)" />
          <XAxis 
            dataKey="date" 
            stroke="#00FFFF"
            tick={{ fill: '#00FFFF' }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            }}
          />
          <YAxis 
            stroke="#00FFFF"
            tick={{ fill: '#00FFFF' }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            domain={getYAxisDomain(filteredData)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15,47,47,0.9)',
              border: '1px solid #18BFBF',
              borderRadius: '4px',
            }}
            labelStyle={{ color: '#00FFFF' }}
            itemStyle={{ color: '#00FFFF' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, selectedGrade]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', { 
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              });
            }}
          />
          <Line 
            type="cardinal" 
            dataKey="price" 
            stroke={GRADE_COLORS[selectedGrade as keyof typeof GRADE_COLORS] || '#18BFBF'} 
            dot={false}
            strokeWidth={2}
            activeDot={{ r: 6, fill: GRADE_COLORS[selectedGrade as keyof typeof GRADE_COLORS] || '#18BFBF' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;

const generateMockPriceHistory = (currentPrice: number, grade: string = 'Ungraded'): { date: string; price: number }[] => {
  if (!currentPrice || isNaN(currentPrice)) return [];
  
  const gradeMultipliers = {
    'Ungraded': 1,
    'PSA 7': 1.5,
    'PSA 8': 2,
    'PSA 9': 3,
    'BGS 9.5': 4,
    'PSA 10': 5
  };

  const multiplier = gradeMultipliers[grade as keyof typeof gradeMultipliers] || 1;
  const basePrice = currentPrice * multiplier;
  const history = [];
  const today = new Date();
  
  // Use a smoother price generation algorithm
  let currentValue = basePrice;
  let trend = 0;
  const volatility = 0.03; // Reduced volatility for smoother lines
  const momentum = 0.8; // Price tendency to continue in same direction
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Smooth price movement calculation
    trend = trend * momentum + (Math.random() - 0.5) * volatility;
    currentValue = Math.max(currentValue * (1 + trend), basePrice * 0.5);
    
    // Add slight upward bias over time
    const timeEffect = 1 + (i / 365) * 0.02;
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Number((currentValue * timeEffect).toFixed(2))
    });
  }
  
  // Apply additional smoothing
  return history.map((point, i, arr) => {
    if (i === 0 || i === arr.length - 1) return point;
    return {
      date: point.date,
      price: Number(((arr[i-1].price + point.price + arr[i+1].price) / 3).toFixed(2))
    };
  });
};

