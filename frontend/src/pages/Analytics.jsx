import { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const Analytics = () => {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data when user or time period changes
  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timePeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsResponse, streakResponse] = await Promise.all([
        timePeriod === 'weekly'
          ? analyticsAPI.getWeekly(user.id)
          : analyticsAPI.getMonthly(user.id),
        analyticsAPI.getStreak(user.id)
      ]);

      setAnalyticsData(analyticsResponse.data);
      setStreakData(streakResponse.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Format minutes to hours:minutes
  const formatMinutesToHours = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Helper: Format date for chart labels
  const formatChartDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Helper: Format date to YYYY-MM-DD without timezone issues
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: Generate complete date range for current week (Sunday to Saturday)
  const generateWeekData = (data) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate Sunday of current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay);

    const result = [];

    // Generate 7 days from Sunday to Saturday
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      const dateStr = formatDateString(date);

      const existingData = data.find(d => d.date === dateStr);

      if (existingData) {
        result.push(existingData);
      } else {
        result.push({
          date: dateStr,
          total: 0,
          completed: 0,
          completion_rate: 0
        });
      }
    }

    return result;
  };

  // Helper: Generate complete date range for current month (1st to last day)
  const generateMonthData = (data) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-11

    // Last day of current month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const result = [];

    // Generate all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDateString(date);

      const existingData = data.find(d => d.date === dateStr);

      if (existingData) {
        result.push(existingData);
      } else {
        result.push({
          date: dateStr,
          total: 0,
          completed: 0,
          completion_rate: 0
        });
      }
    }

    return result;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchAnalytics} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!analyticsData || analyticsData.total_tasks === 0) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-primary" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <p className="text-gray-600">
              Track your progress, completion rates, and see how you're performing against your goals.
            </p>
          </div>
          <div className="text-center py-12 text-gray-500">
            <p>No analytics data available yet.</p>
            <p className="text-sm mt-2">Start logging your daily tasks to see analytics!</p>
          </div>
        </div>
      </div>
    );
  }

  // Get chart data based on period (use actual daily_trend from backend)
  const rawChartData = analyticsData.daily_trend || [];
  const chartData = timePeriod === 'weekly'
    ? generateWeekData(rawChartData)
    : generateMonthData(rawChartData);

  // Get categories with tasks
  const categories = Object.entries(analyticsData.category_breakdown || {})
    .filter(([_, data]) => data.total > 0);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-primary" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Track your progress, completion rates, and see how you're performing against your goals.
          </p>
        </div>

        {/* Period Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTimePeriod('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timePeriod === 'weekly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimePeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timePeriod === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Completion Rate Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-900">Completion Rate</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {analyticsData.completion_rate.toFixed(1)}%
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Last {timePeriod === 'weekly' ? '7' : '30'} days
            </p>
            <div className="mt-3 bg-blue-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${Math.min(analyticsData.completion_rate, 100)}%` }}
              />
            </div>
          </div>

          {/* Current Streak Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-green-600" size={20} />
              <span className="text-sm font-medium text-green-900">Current Streak</span>
            </div>
            <div className="text-3xl font-bold text-green-900">
              {streakData?.current_streak || 0}
            </div>
            <p className="text-sm text-green-700 mt-1">
              {(streakData?.current_streak || 0) === 1 ? 'day' : 'days'} in a row
            </p>
            {streakData?.current_streak > 0 && (
              <p className="text-xs text-green-600 mt-2">
                🔥 Keep it going!
              </p>
            )}
          </div>

          {/* Time Spent Card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-orange-600" size={20} />
              <span className="text-sm font-medium text-orange-900">Time Spent</span>
            </div>
            <div className="text-3xl font-bold text-orange-900">
              {formatMinutesToHours(analyticsData.time_analysis.total_actual_minutes)}
            </div>
            <p className="text-sm text-orange-700 mt-1">
              This {timePeriod === 'weekly' ? 'week' : 'month'}
            </p>
            <p className="text-xs text-orange-600 mt-2">
              Planned: {formatMinutesToHours(analyticsData.time_analysis.total_planned_minutes)}
            </p>
          </div>

          {/* Gap to Goal Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-purple-600" size={20} />
              <span className="text-sm font-medium text-purple-900">Gap to Goal</span>
            </div>
            <div className="text-3xl font-bold text-purple-900">
              {analyticsData.gap_to_goal > 0
                ? Math.ceil(analyticsData.gap_to_goal)
                : '0'}
            </div>
            <p className="text-sm text-purple-700 mt-1">
              tasks to {analyticsData.target_percentage}% goal
            </p>
            {analyticsData.gap_to_goal <= 0 && (
              <p className="text-xs text-purple-600 mt-2">
                ✓ Goal achieved!
              </p>
            )}
          </div>
        </div>

        {/* Daily Completion and Category Breakdown - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Completion Visualization */}
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">
              Daily Completion - {timePeriod === 'weekly'
                ? 'This Week'
                : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>

            {chartData.length > 0 ? (
              <>
                {timePeriod === 'weekly' ? (
                  /* Weekly View - Simple Horizontal Grid */
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2">
                      {chartData.map((day, index) => {
                        const dayDate = new Date(day.date);
                        const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                        const getColorClass = (rate) => {
                          if (rate === 0) return 'bg-gray-100 border-gray-300';
                          if (rate < 25) return 'bg-purple-100 border-purple-200';
                          if (rate < 50) return 'bg-purple-200 border-purple-300';
                          if (rate < 75) return 'bg-purple-400 border-purple-500';
                          return 'bg-purple-600 border-purple-700';
                        };

                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div className="text-[10px] font-medium text-gray-600 mb-1">{dayName}</div>
                            <div
                              className={`w-14 h-14 rounded-lg border-2 ${getColorClass(day.completion_rate)} flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md cursor-pointer`}
                              title={`${dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}: ${day.completed}/${day.total} tasks`}
                            >
                              {day.total === 0 ? (
                                <div className="text-xs text-gray-400">-</div>
                              ) : (
                                <>
                                  <div className={`text-sm font-bold ${day.completion_rate >= 75 ? 'text-white' : 'text-gray-800'}`}>
                                    {day.completed}/{day.total}
                                  </div>
                                  <div className={`text-[10px] ${day.completion_rate >= 75 ? 'text-purple-100' : 'text-gray-600'}`}>
                                    {day.completion_rate.toFixed(0)}%
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="text-[9px] text-gray-500 mt-1">
                              {dayDate.getDate()} {dayDate.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Monthly View - Horizontal Grid */
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1">
                      {chartData.map((day, index) => {
                        const dayDate = new Date(day.date);
                        const getColorClass = (rate) => {
                          if (rate === 0) return 'bg-gray-100 border-gray-300';
                          if (rate < 25) return 'bg-purple-100 border-purple-200';
                          if (rate < 50) return 'bg-purple-200 border-purple-300';
                          if (rate < 75) return 'bg-purple-400 border-purple-500';
                          return 'bg-purple-600 border-purple-700';
                        };

                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded border ${getColorClass(day.completion_rate)} flex flex-col items-center justify-center transition-all hover:scale-110 hover:shadow-md cursor-pointer`}
                              title={`${dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}: ${day.completed}/${day.total} tasks (${day.completion_rate.toFixed(0)}%)`}
                            >
                              {day.total === 0 ? (
                                <div className="text-[8px] text-gray-400">-</div>
                              ) : (
                                <div className={`text-[9px] font-bold ${day.completion_rate >= 75 ? 'text-white' : 'text-gray-700'}`}>
                                  {day.completed}/{day.total}
                                </div>
                              )}
                            </div>
                            <div className="text-[7px] text-gray-500 mt-0.5">
                              {dayDate.getDate()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-600">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
                    <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div>
                    <div className="w-3 h-3 rounded bg-purple-200 border border-purple-300"></div>
                    <div className="w-3 h-3 rounded bg-purple-400 border border-purple-500"></div>
                    <div className="w-3 h-3 rounded bg-purple-600 border border-purple-700"></div>
                  </div>
                  <span>More</span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No completion data available</p>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map(([category, data]) => {
                  const getCategoryColor = (cat) => {
                    const colors = {
                      Learning: 'bg-purple-500',
                      Fitness: 'bg-yellow-500',
                      Rest: 'bg-purple-400',
                      Other: 'bg-gray-500'
                    };
                    return colors[cat] || 'bg-gray-500';
                  };

                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{category}</span>
                        <span className="text-gray-600">
                          {data.completed}/{data.total} ({data.completion_rate.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div
                          className={`${getCategoryColor(category)} h-full transition-all duration-300 flex items-center justify-end pr-2`}
                          style={{ width: `${Math.min(data.completion_rate, 100)}%` }}
                        >
                          {data.completion_rate > 20 && (
                            <span className="text-[10px] text-white font-medium">
                              {data.completion_rate.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
