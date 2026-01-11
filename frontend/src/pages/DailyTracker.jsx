import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
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
  const [today] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

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

  // Get category badge color
  const getCategoryColor = (category) => {
    const colors = {
      Learning: 'bg-blue-100 text-blue-700',
      Fitness: 'bg-green-100 text-green-700',
      Rest: 'bg-purple-100 text-purple-700',
      Other: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.Other;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      done: 'bg-green-100 text-green-700',
      partial: 'bg-yellow-100 text-yellow-700',
      missed: 'bg-red-100 text-red-700',
      skipped: 'bg-gray-100 text-gray-700',
      pending: 'bg-blue-100 text-blue-700'
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
              {tasks.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    {/* Task Header */}
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-medium text-lg">{log.routine_task.name}</h3>
                      <span className={`text-sm px-2 py-1 rounded ${getCategoryColor(log.routine_task.category)}`}>
                        {log.routine_task.category}
                      </span>
                    </div>

                    {/* Status and Time Info */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-sm px-2 py-1 rounded font-medium ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                      <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        Planned: {log.routine_task.planned_minutes} min
                      </span>
                      {log.actual_minutes > 0 && (
                        <span className="text-sm px-2 py-1 bg-green-50 text-green-700 rounded">
                          Actual: {log.actual_minutes} min
                        </span>
                      )}
                    </div>

                    {/* Notes Display */}
                    {log.notes && !expandedTask && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Note:</span> {log.notes}
                      </div>
                    )}

                    {/* Quick Action Buttons */}
                    {expandedTask !== log.id && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => startEdit(log)}>
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
                      <div className="mt-4 pt-4 border-t">
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
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEdit} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTracker;
