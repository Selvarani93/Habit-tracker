import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Dumbbell, Moon, MoreHorizontal, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';

const DailyTracker = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'pending',
    actual_minutes: 0,
    notes: ''
  });

  // Get today's date dynamically (recalculates on each render)
  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  // Format date for display
  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Auto-generate and load tasks on mount
  useEffect(() => {
    if (user) {
      initializeDailyLogs();
    }
  }, [user]);

  // Initialize daily logs: generate missing logs and fetch all
  const initializeDailyLogs = async () => {
    setLoading(true);
    try {
      // Always call generate-today (it will only create missing logs)
      try {
        await logsAPI.generateToday(user.id);
      } catch (genError) {
        // Generation might return empty if no new tasks, that's ok
        console.log('Generation note:', genError);
      }

      // Fetch all logs for today (existing + newly generated)
      const response = await logsAPI.getByUserAndDate(user.id, today);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to initialize daily logs:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Quick status update (for Done/Missed buttons)
  const quickUpdate = async (logId, status) => {
    try {
      await logsAPI.update(logId, { status });
      // Refresh task list
      const response = await logsAPI.getByUserAndDate(user.id, today);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  // Start editing a task
  const startEdit = (log) => {
    setExpandedTask(log.id);
    setEditForm({
      status: log.status,
      actual_minutes: log.actual_minutes,
      notes: log.notes || ''
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setExpandedTask(null);
    setEditForm({
      status: 'pending',
      actual_minutes: 0,
      notes: ''
    });
  };

  // Save full update (status + minutes + notes)
  const handleSaveUpdate = async (logId) => {
    try {
      await logsAPI.update(logId, {
        status: editForm.status,
        actual_minutes: parseInt(editForm.actual_minutes) || 0,
        notes: editForm.notes || null
      });

      cancelEdit();

      // Refresh task list
      const response = await logsAPI.getByUserAndDate(user.id, today);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  // Get category icon and styling
  const getCategoryIcon = (category) => {
    const config = {
      Learning: {
        icon: BookOpen,
        bgColor: 'bg-momentum-lavender',
        iconColor: 'text-purple-700',
        borderColor: 'border-purple-300'
      },
      Fitness: {
        icon: Dumbbell,
        bgColor: 'bg-momentum-cream',
        iconColor: 'text-amber-700',
        borderColor: 'border-yellow-300'
      },
      Rest: {
        icon: Moon,
        bgColor: 'bg-momentum-lavender-light',
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200'
      },
      Other: {
        icon: MoreHorizontal,
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
        borderColor: 'border-gray-300'
      }
    };
    return config[category] || config.Other;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      done: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      partial: 'bg-momentum-cream text-amber-800 border border-yellow-300',
      missed: 'bg-rose-100 text-rose-700 border border-rose-300',
      skipped: 'bg-slate-100 text-slate-600 border border-slate-300',
      pending: 'bg-sky-100 text-sky-700 border border-sky-300'
    };
    return colors[status] || colors.pending;
  };

  // Calculate progress stats
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="text-primary" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Daily Tracker</h1>
          </div>
          <p className="text-gray-600">
            Track your daily routine tasks. Mark them as done, missed, or partial.
          </p>
        </div>

        {/* Date and Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{todayDisplay}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {totalTasks > 0 ? `${completedTasks} of ${totalTasks} tasks completed` : 'No tasks for today'}
              </p>
            </div>
            {totalTasks > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Tasks</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading today's tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No routine tasks found for today.</p>
              <p className="text-sm mt-2">Please create your routine template first in the Routine Template page.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((log) => {
                const categoryConfig = getCategoryIcon(log.routine_task.category);
                const CategoryIcon = categoryConfig.icon;

                return (
                  <Card key={log.id}>
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        {/* Task Header */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* Category Icon Square */}
                          <div className={`${categoryConfig.bgColor} ${categoryConfig.borderColor} border rounded-lg p-2 flex items-center justify-center`}>
                            <CategoryIcon size={20} className={categoryConfig.iconColor} />
                          </div>
                          {/* Task Name */}
                          <h3 className="font-medium text-lg">{log.routine_task.name}</h3>
                        </div>

                        {/* Status and Time Info */}
                        <div className="flex flex-wrap gap-2 mb-3 ml-11">
                          <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${getStatusColor(log.status)}`}>
                            {log.status.toUpperCase()}
                          </span>
                          <span className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full border border-gray-300 font-medium">
                            Planned: {log.routine_task.planned_minutes} min
                          </span>
                          {log.actual_minutes > 0 && (
                            <span className="text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-300 font-medium">
                              Actual: {log.actual_minutes} min
                            </span>
                          )}
                        </div>

                        {/* Notes Display */}
                        {log.notes && !expandedTask && (
                          <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700 ml-11">
                            <span className="font-medium">Note:</span> {log.notes}
                          </div>
                        )}
                      </div>

                      {/* Quick Action Buttons */}
                      {expandedTask !== log.id && (
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => startEdit(log)}>
                            <Pencil size={16} className="mr-1" />
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => quickUpdate(log.id, 'done')}
                            className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                          >
                            ✓ Done
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => quickUpdate(log.id, 'missed')}
                            className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          >
                            ✗ Missed
                          </Button>
                        </div>
                      )}

                      {/* Expandable Edit Form */}
                      {expandedTask === log.id && (
                      <div className="w-full mt-4 pt-4 border-t ml-11">
                        <h4 className="font-medium mb-3">Update Task Details</h4>

                        {/* Status Selector */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <div className="flex flex-wrap gap-2">
                            {['done', 'partial', 'missed', 'skipped', 'pending'].map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setEditForm({ ...editForm, status })}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  editForm.status === status
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Actual Minutes */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Actual Time (minutes)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={editForm.actual_minutes}
                            onChange={(e) => setEditForm({ ...editForm, actual_minutes: e.target.value })}
                            placeholder="e.g., 25"
                          />
                        </div>

                        {/* Notes */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (optional)
                          </label>
                          <textarea
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            rows="3"
                            placeholder="Add any notes about this task..."
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button onClick={() => handleSaveUpdate(log.id)} className="flex-1">
                            <Check size={16} className="mr-1" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEdit} className="flex-1">
                            <X size={16} className="mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTracker;
