import { TrendingUp } from 'lucide-react';

const DailyProgressChart = ({ data, timePeriod }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No progress data available</p>
      </div>
    );
  }

  // Find max values for scaling
  const maxCompletionRate = 100;
  const maxMinutes = Math.max(...data.map(d => Math.max(d.actual_minutes, d.planned_minutes)));

  // Format time
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-primary" size={20} />
        <h2 className="text-lg font-semibold">Daily Progress Overview</h2>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-600">Completion Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-600">Time Spent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-gray-300"></div>
          <span className="text-gray-600">Planned Time</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 border-l border-b border-gray-200">
        {/* Y-axis labels - Left (Completion %) */}
        <div className="absolute left-0 top-0 bottom-0 -ml-8 flex flex-col justify-between text-xs text-gray-500">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Y-axis labels - Right (Time) */}
        <div className="absolute right-0 top-0 bottom-0 -mr-12 flex flex-col justify-between text-xs text-gray-500 text-right">
          <span>{formatTime(maxMinutes)}</span>
          <span>{formatTime(Math.floor(maxMinutes * 0.75))}</span>
          <span>{formatTime(Math.floor(maxMinutes * 0.5))}</span>
          <span>{formatTime(Math.floor(maxMinutes * 0.25))}</span>
          <span>0m</span>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-gray-100"></div>
          ))}
        </div>

        {/* Data visualization */}
        <svg className="w-full h-full" preserveAspectRatio="none">
          {/* Planned time line (dashed) */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - (d.planned_minutes / maxMinutes * 100);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#d1d5db"
            strokeWidth="2"
            strokeDasharray="4"
            vectorEffect="non-scaling-stroke"
          />

          {/* Actual time line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - (d.actual_minutes / maxMinutes * 100);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />

          {/* Completion rate line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - d.completion_rate;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#9333ea"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const completionY = 100 - d.completion_rate;
            const timeY = 100 - (d.actual_minutes / maxMinutes * 100);

            return (
              <g key={i}>
                {/* Completion rate point */}
                <circle
                  cx={`${x}%`}
                  cy={`${completionY}%`}
                  r="4"
                  fill="#9333ea"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`${new Date(d.date).toLocaleDateString()}: ${d.completion_rate.toFixed(0)}% completion`}</title>
                </circle>

                {/* Time spent point */}
                <circle
                  cx={`${x}%`}
                  cy={`${timeY}%`}
                  r="4"
                  fill="#f97316"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>{`${new Date(d.date).toLocaleDateString()}: ${formatTime(d.actual_minutes)} spent`}</title>
                </circle>
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((d, i) => {
            if (timePeriod === 'weekly' || i % Math.ceil(data.length / 7) === 0) {
              const date = new Date(d.date);
              return (
                <span key={i} className="text-center">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Summary stats below chart */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t">
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Avg Completion</div>
          <div className="text-lg font-bold text-purple-600">
            {(data.reduce((sum, d) => sum + d.completion_rate, 0) / data.length).toFixed(0)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Total Time</div>
          <div className="text-lg font-bold text-orange-600">
            {formatTime(data.reduce((sum, d) => sum + d.actual_minutes, 0))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Efficiency</div>
          <div className="text-lg font-bold text-green-600">
            {(() => {
              const totalActual = data.reduce((sum, d) => sum + d.actual_minutes, 0);
              const totalPlanned = data.reduce((sum, d) => sum + d.planned_minutes, 0);
              return totalPlanned > 0 ? ((totalActual / totalPlanned) * 100).toFixed(0) : 0;
            })()}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProgressChart;
