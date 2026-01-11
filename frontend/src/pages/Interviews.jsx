import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { interviewsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';

const Interviews = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    date_applied: '',
    status: 'applied',
    interview_rounds: '',
    priority: 'medium',
    notes: '',
    follow_up_date: ''
  });

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'applied', label: 'Applied' },
    { value: 'replied', label: 'Replied' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'interview_done', label: 'Interview Done' },
    { value: 'offer', label: 'Offer' },
    { value: 'rejected', label: 'Rejected' },
  ];

  // Load interviews when user or filter changes
  useEffect(() => {
    if (user) {
      loadInterviews();
    }
  }, [user, statusFilter]);

  // Fetch interviews with optional status filter
  const loadInterviews = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await interviewsAPI.getByUserId(user.id, filters);
      setInterviews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company_name.trim() || !formData.role.trim()) {
      alert('Company name and role are required');
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        company_name: formData.company_name,
        role: formData.role,
        date_applied: formData.date_applied || null,
        status: formData.status,
        interview_rounds: formData.interview_rounds || null,
        priority: formData.priority,
        notes: formData.notes || null,
        follow_up_date: formData.follow_up_date || null
      };

      if (editingInterview) {
        await interviewsAPI.update(editingInterview.id, payload);
      } else {
        await interviewsAPI.create(payload);
      }

      resetForm();
      loadInterviews();
    } catch (error) {
      console.error('Failed to save interview:', error);
      alert('Failed to save interview. Please try again.');
    }
  };

  // Handle interview deletion
  const handleDelete = async (interviewId) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      try {
        await interviewsAPI.delete(interviewId);
        loadInterviews();
      } catch (error) {
        console.error('Failed to delete interview:', error);
        alert('Failed to delete interview. Please try again.');
      }
    }
  };

  // Start editing an interview
  const startEdit = (interview) => {
    setEditingInterview(interview);
    setFormData({
      company_name: interview.company_name,
      role: interview.role,
      date_applied: interview.date_applied || '',
      status: interview.status,
      interview_rounds: interview.interview_rounds || '',
      priority: interview.priority,
      notes: interview.notes || '',
      follow_up_date: interview.follow_up_date || ''
    });
    setShowForm(true);
  };

  // Reset form to initial state
  const resetForm = () => {
    setShowForm(false);
    setEditingInterview(null);
    setFormData({
      company_name: '',
      role: '',
      date_applied: '',
      status: 'applied',
      interview_rounds: '',
      priority: 'medium',
      notes: '',
      follow_up_date: ''
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-gray-100 text-gray-700',
      replied: 'bg-blue-100 text-blue-700',
      interview_scheduled: 'bg-yellow-100 text-yellow-700',
      interview_done: 'bg-green-100 text-green-700',
      offer: 'bg-green-200 text-green-800',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.applied;
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-gray-100 text-gray-600'
    };
    return colors[priority] || colors.medium;
  };

  // Format status for display
  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="text-primary" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Interview Tracker</h1>
          </div>
          <p className="text-gray-600">
            Track your job applications and interview progress.
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* Add Button */}
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                + Add Interview
              </Button>
            )}
          </div>
        </div>

        {/* Inline Add/Edit Form */}
        {showForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingInterview ? 'Edit Interview' : 'Add New Interview'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Google"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role/Position *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Software Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>

                {/* Date Applied */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Applied
                  </label>
                  <Input
                    type="date"
                    value={formData.date_applied}
                    onChange={(e) => setFormData({ ...formData, date_applied: e.target.value })}
                  />
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="applied">Applied</option>
                    <option value="replied">Replied</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="interview_done">Interview Done</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Priority Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Interview Rounds */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Rounds (e.g., "Round 2/3")
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Round 2/3"
                    value={formData.interview_rounds}
                    onChange={(e) => setFormData({ ...formData, interview_rounds: e.target.value })}
                  />
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <Input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    rows="4"
                    placeholder="Add any notes about this interview..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    {editingInterview ? 'Update Interview' : 'Create Interview'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Interviews List */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Applications</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading interviews...</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No interviews found.</p>
              <p className="text-sm mt-2">Click "Add Interview" to track your first application.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="p-6">
                    {/* Header: Company & Role */}
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{interview.company_name}</h3>
                        <p className="text-gray-700 font-medium">{interview.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(interview)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(interview.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Badges: Status & Priority */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(interview.status)}`}>
                        {formatStatus(interview.status)}
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${getPriorityColor(interview.priority)}`}>
                        {interview.priority.toUpperCase()} Priority
                      </span>
                    </div>

                    {/* Interview Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {interview.date_applied && (
                        <div>
                          <span className="text-gray-600">Applied:</span>
                          <p className="font-medium">{formatDate(interview.date_applied)}</p>
                        </div>
                      )}
                      {interview.interview_rounds && (
                        <div>
                          <span className="text-gray-600">Round:</span>
                          <p className="font-medium">{interview.interview_rounds}</p>
                        </div>
                      )}
                      {interview.follow_up_date && (
                        <div>
                          <span className="text-gray-600">Follow-up:</span>
                          <p className="font-medium">{formatDate(interview.follow_up_date)}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <p className="font-medium">{formatDate(interview.created_at)}</p>
                      </div>
                    </div>

                    {/* Notes (if any) */}
                    {interview.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{interview.notes}</p>
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

export default Interviews;
