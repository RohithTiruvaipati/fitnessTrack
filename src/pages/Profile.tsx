import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/firestore';
import { Card } from '../components/Card';

export function Profile() {
  const { userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    startingWeight: userProfile?.startingWeight || 0,
    goalWeight: userProfile?.goalWeight || 0,
    goalType: userProfile?.goalType || 'maintain',
    focusAreas: userProfile?.focusAreas || [],
  });
  const [newFocusArea, setNewFocusArea] = useState('');
  const [saving, setSaving] = useState(false);

  const FOCUS_OPTIONS = [
    'Fat Loss',
    'Muscle Gain',
    'Consistency',
    'Diet',
    'Strength',
    'Cardio',
    'Flexibility',
    'Sleep',
  ];

  const handleSave = async () => {
    if (!userProfile) return;
    
    setSaving(true);
    try {
      await userService.updateUser(userProfile.id, {
        startingWeight: formData.startingWeight,
        goalWeight: formData.goalWeight,
        goalType: formData.goalType,
        focusAreas: formData.focusAreas,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const addFocusArea = () => {
    if (newFocusArea && !formData.focusAreas.includes(newFocusArea)) {
      setFormData({ ...formData, focusAreas: [...formData.focusAreas, newFocusArea] });
      setNewFocusArea('');
    }
  };

  const removeFocusArea = (area: string) => {
    setFormData({
      ...formData,
      focusAreas: formData.focusAreas.filter((a) => a !== area),
    });
  };

  if (!userProfile) {
    return <div className="text-dark-text">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">Profile</h1>
          <p className="text-dark-muted">Manage your fitness goals and focus areas</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-dark-muted mb-2">Name</label>
            <p className="text-lg text-dark-text">{userProfile.name}</p>
          </div>

          <div>
            <label className="block text-sm text-dark-muted mb-2">Email</label>
            <p className="text-lg text-dark-text">{userProfile.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-dark-muted mb-2">Starting Weight (lbs)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.startingWeight}
                  onChange={(e) => setFormData({ ...formData, startingWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                />
              ) : (
                <p className="text-lg text-dark-text">{userProfile.startingWeight.toFixed(1)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-dark-muted mb-2">Goal Weight (lbs)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.goalWeight}
                  onChange={(e) => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                />
              ) : (
                <p className="text-lg text-dark-text">{userProfile.goalWeight.toFixed(1)}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-muted mb-2">Goal Type</label>
            {isEditing ? (
              <select
                value={formData.goalType}
                onChange={(e) => setFormData({ ...formData, goalType: e.target.value as 'cut' | 'bulk' | 'maintain' })}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
              >
                <option value="cut">Cut (Weight Loss)</option>
                <option value="bulk">Bulk (Weight Gain)</option>
                <option value="maintain">Maintain</option>
              </select>
            ) : (
              <p className="text-lg text-dark-text capitalize">{userProfile.goalType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-dark-muted mb-2">Focus Areas</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.focusAreas.map((area, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm flex items-center gap-2"
                >
                  {area}
                  {isEditing && (
                    <button
                      onClick={() => removeFocusArea(area)}
                      className="text-primary-400 hover:text-primary-300"
                    >
                      ×
                    </button>
                  )}
                </motion.span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFocusArea}
                  onChange={(e) => setNewFocusArea(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFocusArea()}
                  placeholder="Add focus area"
                  className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={addFocusArea}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
            {isEditing && (
              <div className="mt-4">
                <p className="text-sm text-dark-muted mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        if (!formData.focusAreas.includes(option)) {
                          setFormData({ ...formData, focusAreas: [...formData.focusAreas, option] });
                        }
                      }}
                      disabled={formData.focusAreas.includes(option)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        formData.focusAreas.includes(option)
                          ? 'bg-dark-border text-dark-muted cursor-not-allowed'
                          : 'bg-dark-bg border border-dark-border text-dark-text hover:border-primary-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: userProfile.name,
                    startingWeight: userProfile.startingWeight,
                    goalWeight: userProfile.goalWeight,
                    goalType: userProfile.goalType,
                    focusAreas: userProfile.focusAreas,
                  });
                }}
                className="px-6 py-2 bg-dark-border text-dark-text rounded-lg hover:bg-dark-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
