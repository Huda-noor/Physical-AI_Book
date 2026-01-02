import React, { useState } from 'react';
import { useAuth } from '@site/src/contexts/AuthContext';
import { authClient } from '@site/src/auth/client';

const SignupForm: React.FC = () => {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    // Software Skills
    python: 'beginner',
    typescript: 'none',
    cpp: 'none',
    ros2: 'none',
    // Robotics Experience
    roboticsExperience: 'none',
    // Hardware Access
    hardwareAccess: [] as string[],
    // Learning Goals
    learningGoals: [] as string[],
  });

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
    { value: 'robot_kit', label: 'Robot Kit (TurtleBot, etc.)' },
    { value: 'lidar', label: 'LiDAR' },
    { value: 'camera_depth', label: 'Depth Camera' }
  ];
  const goalOptions = [
    { value: 'career_change', label: 'Career change to robotics' },
    { value: 'academic_research', label: 'Academic research' },
    { value: 'hobby', label: 'Hobby/personal projects' },
    { value: 'professional_dev', label: 'Professional development' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleHardware = (value: string) => {
    setFormData(prev => ({
      ...prev,
      hardwareAccess: prev.hardwareAccess.includes(value)
        ? prev.hardwareAccess.filter(i => i !== value)
        : [...prev.hardwareAccess, value]
    }));
  };

  const toggleGoal = (value: string) => {
    setFormData(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(value)
        ? prev.learningGoals.filter(i => i !== value)
        : [...prev.learningGoals, value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = {
        softwareExperience: {
          python: formData.python,
          typescript: formData.typescript,
          cpp: formData.cpp,
          ros2: formData.ros2
        },
        roboticsExperience: formData.roboticsExperience,
        hardwareAccess: formData.hardwareAccess,
        learningGoals: formData.learningGoals
      };

      // 1. Create user in Better Auth
      const { data, error: authError } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/"
      });

      if (authError) throw new Error(authError.message);

      // 2. Create profile in Backend
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const profileResponse = await fetch(`${apiUrl}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Better Auth session token is in cookies, which fetch includes by default
          // with credentials: 'include'.
        },
        credentials: 'include',
        body: JSON.stringify({
          software_experience: {
            python: formData.python,
            typescript: formData.typescript,
            cpp: formData.cpp,
            ros2: formData.ros2
          },
          robotics_experience: formData.robotics_experience,
          hardware_access: formData.hardwareAccess,
          learning_goals: formData.learningGoals
        }),
      });

      if (!profileResponse.ok) {
        console.warn('User created but profile save failed. Retrying later.');
      }

      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Join the Course</h2>
        <div className="flex justify-center mt-4 space-x-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-2 w-12 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Software & Robotics Skills</h3>
            <div className="grid grid-cols-2 gap-4">
              {['python', 'cpp', 'ros2', 'typescript'].map(lang => (
                <div key={lang}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{lang === 'cpp' ? 'C++' : lang}</label>
                  <select
                    name={lang}
                    value={formData[lang as keyof typeof formData] as string}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    {softwareLevels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Robotics Experience</label>
              <div className="space-y-2">
                {roboticsExpLevels.map(level => (
                  <label key={level.value} className="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition">
                    <input
                      type="radio"
                      name="roboticsExperience"
                      value={level.value}
                      checked={formData.roboticsExperience === level.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-3 text-sm text-gray-700">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Hardware & Goals</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hardware Access</label>
              <div className="grid grid-cols-2 gap-2">
                {hardwareOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleHardware(opt.value)}
                    className={`px-3 py-2 text-xs font-medium rounded-full border transition ${
                      formData.hardwareAccess.includes(opt.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Goals</label>
              <div className="space-y-2">
                {goalOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleGoal(opt.value)}
                    className={`w-full text-left px-4 py-3 text-sm rounded-lg border transition ${
                      formData.learning_goals.includes(opt.value)
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex pt-6 space-x-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Previous
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-[2] py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (step === 3 ? 'Complete Signup' : 'Next Step')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
