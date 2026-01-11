import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Dumbbell, Moon, MoreHorizontal, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { routineTasksAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const RoutineTemplate = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Learning',
    planned_minutes: 0,
    active_days: ['Monday']
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const categories = ['Learning', 'Fitness', 'Rest', 'Other'];

  // Load tasks when day changes or component mounts
  useEffect(() => {
    if (user) {
      loadTasksForDay(selectedDay);
    }
  }, [selectedDay, user]);

  // Fetch tasks for selected day
  const loadTasksForDay = async (day) => {
    setLoading(true);
    try {
      const response = await routineTasksAPI.getByUserAndDay(user.id, day);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      alert('Please enter a task name');
      return;
    }

    if (formData.active_days.length === 0) {
      alert('Please select at least one active day');
      return;
    }

    try {
      if (editingTask) {
        // Update existing task
        await routineTasksAPI.update(editingTask.id, {
          name: formData.name,
          category: formData.category,
          planned_minutes: parseInt(formData.planned_minutes),
          active_days: formData.active_days
        });
      } else {
        // Create new task
        await routineTasksAPI.create({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          planned_minutes: parseInt(formData.planned_minutes),
          active_days: formData.active_days
        });
      }

      resetForm();
      loadTasksForDay(selectedDay);
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  // Handle task deletion
  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? This will also remove all associated daily logs.')) {
      try {
        await routineTasksAPI.delete(taskId);
        loadTasksForDay(selectedDay);
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  // Start editing a task
  const startEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      category: task.category,
      planned_minutes: task.planned_minutes,
      active_days: task.active_days
    });
    setShowForm(true);
  };

  // Reset form to initial state
  const resetForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({
      name: '',
      category: 'Learning',
      planned_minutes: 0,
      active_days: [selectedDay]
    });
  };

  // Toggle active day checkbox
  const handleCheckboxChange = (day) => {
    setFormData(prev => ({
      ...prev,
      active_days: prev.active_days.includes(day)
        ? prev.active_days.filter(d => d !== day)
        : [...prev.active_days, day]
    }));
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-primary" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Weekly Routine Template</h1>
          </div>
          <p className="text-gray-600">
            Define your weekly routine. Tasks will be auto-generated daily based on this template.
          </p>
        </div>

        {/* Day Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Day</h2>
          <div className="flex gap-2 flex-wrap">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Inline Add/Edit Form */}
        {showForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Morning Jog"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Planned Minutes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planned Time (minutes) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 30"
                    value={formData.planned_minutes}
                    onChange={(e) => setFormData({ ...formData, planned_minutes: e.target.value })}
                    required
                  />
                </div>

                {/* Active Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active Days * (Select all days when this task should appear)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-2 p-2 border border-border rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.active_days.includes(day)}
                          onChange={() => handleCheckboxChange(day)}
                          className="w-4 h-4 text-primary focus:ring-2 focus:ring-ring rounded"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    {editingTask ? (
                      <>
                        <Check size={16} className="mr-1" />
                        Update Task
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-1" />
                        Create Task
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    <X size={16} className="mr-1" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tasks for {selectedDay}</h2>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus size={16} className="mr-1" />
                Add Task
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No tasks defined for {selectedDay} yet.</p>
              <p className="text-sm mt-2">Click "Add Task" to create your first routine task.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const categoryConfig = getCategoryIcon(task.category);
                const CategoryIcon = categoryConfig.icon;

                return (
                  <Card key={task.id}>
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {/* Category Icon Square */}
                          <div className={`${categoryConfig.bgColor} ${categoryConfig.borderColor} border rounded-lg p-2 flex items-center justify-center`}>
                            <CategoryIcon size={20} className={categoryConfig.iconColor} />
                          </div>
                          {/* Task Name */}
                          <h3 className="font-medium text-lg">{task.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 ml-11">
                          <span className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full border border-gray-300 font-medium">
                            {task.planned_minutes} min
                          </span>
                          <span className="text-xs text-gray-600 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                            Active: {task.active_days.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(task)}>
                          <Pencil size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </div>
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

export default RoutineTemplate;
