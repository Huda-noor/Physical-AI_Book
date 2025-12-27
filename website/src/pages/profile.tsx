import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '@site/src/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, isLoading, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    softwareBackground: '',
    programmingLanguages: '',
    roboticsExperience: '',
    hardwareAccess: [] as string[],
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profile) {
      setEditData({
        softwareBackground: user.profile.softwareBackground || '',
        programmingLanguages: user.profile.programmingLanguages?.join(', ') || '',
        roboticsExperience: user.profile.roboticsExperience || '',
        hardwareAccess: user.profile.hardwareAccess || [],
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      const profile = {
        softwareBackground: editData.softwareBackground,
        programmingLanguages: editData.programmingLanguages.split(',').map(lang => lang.trim()).filter(lang => lang),
        roboticsExperience: editData.roboticsExperience,
        hardwareAccess: editData.hardwareAccess,
      };
      
      updateProfile(profile)
        .then(() => {
          setMessage('Profile updated successfully!');
          setTimeout(() => setMessage(null), 3000);
        })
        .catch(error => {
          setMessage(error.message || 'Error updating profile');
          setTimeout(() => setMessage(null), 3000);
        });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (option: string) => {
    setEditData(prev => {
      if (prev.hardwareAccess.includes(option)) {
        return {
          ...prev,
          hardwareAccess: prev.hardwareAccess.filter(item => item !== option)
        };
      } else {
        return {
          ...prev,
          hardwareAccess: [...prev.hardwareAccess, option]
        };
      }
    });
  };

  if (isLoading) {
    return (
      <Layout title="Loading..." description="Loading your profile information">
        <main className="container margin-vert--lg">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div className="text-center">
                <p>Loading profile...</p>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Profile" description="Please sign in to view your profile">
        <main className="container margin-vert--lg">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div className="text-center">
                <p>Please sign in to view your profile</p>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="User Profile" description="Manage your profile information for the AI-powered educational platform">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <div className="card">
              <div className="card__header">
                <h2>User Profile</h2>
              </div>
              
              {message && (
                <div className={`alert ${message.includes('successfully') ? 'alert--success' : 'alert--danger'}`}>
                  {message}
                </div>
              )}
              
              <div className="card__body">
                <div className="row">
                  <div className="col col--6">
                    <h3>Account Information</h3>
                    <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="col col--6">
                    <h3>Learning Profile</h3>
                    
                    {isEditing ? (
                      <div className="profile-edit-form">
                        <div className="margin-bottom--md">
                          <label htmlFor="softwareBackground" className="form-label">Software Background</label>
                          <select
                            id="softwareBackground"
                            name="softwareBackground"
                            value={editData.softwareBackground}
                            onChange={handleInputChange}
                            className="form-control"
                          >
                            <option value="">Select background</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        
                        <div className="margin-bottom--md">
                          <label htmlFor="programmingLanguages" className="form-label">Programming Languages Known</label>
                          <input
                            type="text"
                            id="programmingLanguages"
                            name="programmingLanguages"
                            value={editData.programmingLanguages}
                            onChange={handleInputChange}
                            placeholder="e.g., Python, C++, JavaScript"
                            className="form-control"
                          />
                          <p className="text--small margin-bottom--sm">Separate multiple languages with commas</p>
                        </div>
                        
                        <div className="margin-bottom--md">
                          <label htmlFor="roboticsExperience" className="form-label">Robotics Experience</label>
                          <select
                            id="roboticsExperience"
                            name="roboticsExperience"
                            value={editData.roboticsExperience}
                            onChange={handleInputChange}
                            className="form-control"
                          >
                            <option value="">Select experience</option>
                            <option value="none">No experience</option>
                            <option value="simulation-only">Simulation only</option>
                            <option value="real hardware">Real hardware</option>
                          </select>
                        </div>
                        
                        <div className="margin-bottom--md">
                          <label className="form-label">Hardware Access</label>
                          <div className="checkbox-group">
                            {['GPU', 'Jetson', 'Robot kits', 'None'].map(hw => (
                              <label key={hw} className="display-block margin-bottom--sm">
                                <input
                                  type="checkbox"
                                  checked={editData.hardwareAccess.includes(hw.toLowerCase())}
                                  onChange={() => handleMultiSelectChange(hw.toLowerCase())}
                                  className="margin-right--sm"
                                />
                                {hw}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Software Background:</strong> {user.profile?.softwareBackground || 'Not specified'}</p>
                        <p><strong>Programming Languages:</strong> {user.profile?.programmingLanguages?.join(', ') || 'Not specified'}</p>
                        <p><strong>Robotics Experience:</strong> {user.profile?.roboticsExperience || 'Not specified'}</p>
                        <p><strong>Hardware Access:</strong> {user.profile?.hardwareAccess?.join(', ') || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="row margin-top--lg">
                  <div className="col col--12">
                    <div className="button-group button-group--block">
                      <button 
                        onClick={handleEditToggle}
                        className={`button button--${isEditing ? 'success' : 'primary'}`}
                      >
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                      </button>
                      
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            await signOut();
                            // Redirect to homepage after sign out
                            window.location.href = '/';
                          } catch (error) {
                            console.error('Sign out error:', error);
                          }
                        }}
                        className="button button--secondary"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;