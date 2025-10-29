import React, { useState } from 'react';
import './Profile.css'; // Assuming a corresponding CSS file

const mockUser = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  company: 'Innovate Solutions Inc.',
  role: 'Marketing Director',
  avatarUrl: 'https://i.pravatar.cc/150?img=5',
};

const Profile = () => {
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockUser);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // In a real application, this would be an API call to update the user profile
    setUser(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate upload and update avatar URL
      const newAvatarUrl = URL.createObjectURL(file);
      setUser(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      alert('Avatar uploaded successfully!');
    }
  };

  return (
    <div className="profile-settings-container">
      <header className="settings-header">
        <h1>Profile Settings</h1>
        <p>Manage your personal and company information.</p>
      </header>

      <div className="profile-card">
        <div className="avatar-section">
          <img src={user.avatarUrl} alt="User Avatar" className="profile-avatar" />
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
          <button
            className="upload-avatar-button"
            onClick={() => document.getElementById('avatar-upload').click()}
            disabled={!isEditing}
          >
            Change Avatar
          </button>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className="input-group">
              <label htmlFor="company">Company Name</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="input-group">
              <label htmlFor="role">Your Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="form-actions">
            {!isEditing ? (
              <button type="button" className="edit-button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <>
                <button type="submit" className="save-button">Save Changes</button>
                <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
