import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '@site/src/contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, isLoading, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    python: 'none',
    cpp: 'none',
    ros2: 'none',
    typescript: 'none',
    robotics_experience: 'none',
    hardware_access: [] as string[],
    learning_goals: [] as string[],
  });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'danger' } | null>(null);

  const softwareLevels = ['none', 'beginner', 'intermediate', 'advanced'];
  const roboticsExpLevels = [
    { value: 'none', label: 'No experience' },
    { value: 'simulation_only', label: 'Simulation only (Gazebo, Isaac Sim)' },
    { value: 'real_hardware', label: 'Real hardware (Robot kits, custom builds)' }
  ];
  const hardwareOptions = [
    { value: 'gpu_nvidia', label: 'NVIDIA GPU' },
    { value: 'jetson_nano', label: 'Jetson Nano' },
    { value: 'jetson_orin', label: 'Jetson Orin' },
    { value: 'robot_kit', label: 'Robot Kit' },
    { value: 'lidar', label: 'LiDAR' },
    { value: 'camera_depth', label: 'Depth Camera' }
  ];

  useEffect(() => {
    if (user?.profile) {
      setEditData({
        python: user.profile.software_experience.python || 'none',
        cpp: user.profile.software_experience.cpp || 'none',
        ros2: user.profile.software_experience.ros2 || 'none',
        typescript: user.profile.software_experience.typescript || 'none',
        robotics_experience: user.profile.robotics_experience || 'none',
        hardware_access: user.profile.hardware_access || [],
        learning_goals: user.profile.learning_goals || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const profile = {
        software_experience: {
          python: editData.python,
          cpp: editData.cpp,
          ros2: editData.ros2,
          typescript: editData.typescript,
        },
        robotics_experience: editData.robotics_experience,
        hardware_access: editData.hardware_access,
        learning_goals: editData.learning_goals,
      };

      await updateProfile(profile);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ text: error.message || 'Error updating profile', type: 'danger' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const toggleHardware = (value: string) => {
    setEditData(prev => ({
      ...prev,
      hardware_access: prev.hardware_access.includes(value)
        ? prev.hardware_access.filter(i => i !== value)
        : [...prev.hardware_access, value]
    }));
  };

  if (isLoading) {
    return (
      <Layout title="Loading...">
        <div className="container margin-vert--xl text--center">
          <p>Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Profile">
        <div className="container margin-vert--xl text--center">
          <p>Please sign in to view your profile.</p>
          <a href="/signin" className="button button--primary">Sign In</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Profile">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--10 col--offset-1">
            <div className="card shadow--md">
              <div className="card__header" style={{ borderBottom: '1px solid var(--ifm-color-emphasis-200)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h1>Your Background Profile</h1>
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`button button--${isEditing ? 'success' : 'primary'}`}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`alert alert--${message.type} margin--md`}>
                  {message.text}
                </div>
              )}

              <div className="card__body">
                <div className="row">
                  <div className="col col--4">
                    <div style={{ padding: '1rem', background: 'var(--ifm-color-emphasis-100)', borderRadius: '8px' }}>
                      <h3>Account</h3>
                      <p><strong>Name:</strong> {user.name || 'Student'}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <hr />
                      <button onClick={signOut} className="button button--secondary button--block">Sign Out</button>
                    </div>
                  </div>

                  <div className="col col--8">
                    <h3>Technical Background</h3>

                    {isEditing ? (
                      <div className="space-y-4">
                        <section className="margin-bottom--lg">
                          <h4>Software Skills</h4>
                          <div className="row">
                            {['python', 'cpp', 'ros2', 'typescript'].map(lang => (
                              <div className="col col--6 margin-bottom--md" key={lang}>
                                <label className="text--bold uppercase" style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-600)' }}>
                                  {lang.toUpperCase()}
                                </label>
                                <select
                                  name={lang}
                                  value={editData[lang as keyof typeof editData] as string}
                                  onChange={handleInputChange}
                                  className="button button--secondary button--block text--left"
                                  style={{ background: 'white', border: '1px solid var(--ifm-color-emphasis-300)', color: 'black' }}
                                >
                                  {softwareLevels.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="margin-bottom--lg">
                          <h4>Robotics Experience</h4>
                          <div className="space-y-2">
                            {roboticsExpLevels.map(opt => (
                              <label key={opt.value} className="display-block margin-bottom--sm pointer">
                                <input
                                  type="radio"
                                  name="robotics_experience"
                                  value={opt.value}
                                  checked={editData.robotics_experience === opt.value}
                                  onChange={handleInputChange}
                                  className="margin-right--sm"
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </section>

                        <section className="margin-bottom--lg">
                          <h4>Hardware Access</h4>
                          <div className="row">
                            {hardwareOptions.map(opt => (
                              <div className="col col--4 margin-bottom--sm" key={opt.value}>
                                <button
                                  type="button"
                                  onClick={() => toggleHardware(opt.value)}
                                  className={`button button--sm button--block ${editData.hardware_access.includes(opt.value) ? 'button--primary' : 'button--outline button--secondary'}`}
                                >
                                  {opt.label}
                                </button>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    ) : (
                      <div className="row">
                        <div className="col col--6">
                          <h4>Software</h4>
                          <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li>🚀 Python: <strong>{editData.python}</strong></li>
                            <li>⚙️ C++: <strong>{editData.cpp}</strong></li>
                            <li>🤖 ROS 2: <strong>{editData.ros2}</strong></li>
                            <li>🌐 TypeScript: <strong>{editData.typescript}</strong></li>
                          </ul>
                        </div>
                        <div className="col col--6">
                          <h4>Experience & Gear</h4>
                          <p><strong>Robotics:</strong> {roboticsExpLevels.find(l => l.value === editData.robotics_experience)?.label}</p>
                          <p><strong>Hardware:</strong> {editData.hardware_access.length > 0 ? editData.hardware_access.join(', ') : 'None'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card__footer" style={{ borderTop: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-color-emphasis-100)' }}>
                <p className="text--italic text--small">
                   Your background profile is used to personalize the textbook chapters and AI chatbot responses.
                   Updating your profile will invalidate existing cached personalizations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;
