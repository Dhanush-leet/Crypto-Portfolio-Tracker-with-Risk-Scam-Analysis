import React from 'react';

/**
 * Renders a small SVG sparkline chart
 * @param {Object} props - Component props
 * @param {number[]} props.data - Array of numeric values to plot
 * @param {string} [props.color='#4CAF50'] - Line color
 * @param {number} [props.width=100] - Width of the SVG
 * @param {number} [props.height=30] - Height of the SVG
 */
const Sparkline = ({ 
  data = [], 
  color = '#4CAF50', 
  width = 100, 
  height = 30 
}) => {
  // Don't render if no data
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  // Normalize data to fit within SVG dimensions
  const minX = 0;
  const maxX = data.length - 1;
  const minY = Math.min(...data);
  const maxY = Math.max(...data);
  
  // Avoid division by zero
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  
  // Create SVG path
  const points = data.map((value, index) => {
    const x = ((index - minX) / rangeX) * width;
    const y = height - ((value - minY) / rangeY) * height;
    return `${x},${y}`;
  }).join(' ');

  // Calculate if the trend is positive (green) or negative (red)
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const trendColor = lastValue >= firstValue ? '#4CAF50' : '#F44336';

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={trendColor}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

export default Sparkline;