import React, { useState } from 'react';
import { useAuth } from '@site/src/contexts/AuthContext';

interface ProfileFormData {
  softwareBackground: string;
  programmingLanguages: string;
  roboticsExperience: string;
  hardwareAccess: string[];
}

const SignupForm: React.FC = () => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    softwareBackground: '',
    programmingLanguages: '',
    roboticsExperience: '',
    hardwareAccess: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hardwareAccess' ? 
        (e.target as HTMLInputElement).checked ? 
          [...prev.hardwareAccess, value] : 
          prev.hardwareAccess.filter(item => item !== value) :
        value
    }));
  };

  const handleMultiSelectChange = (option: string) => {
    setFormData(prev => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare profile data
      const profile = {
        softwareBackground: formData.softwareBackground,
        programmingLanguages: formData.programmingLanguages.split(',').map(lang => lang.trim()).filter(lang => lang),
        roboticsExperience: formData.roboticsExperience,
        hardwareAccess: formData.hardwareAccess,
      };

      // Call the signup function with profile data
      await signUp(formData.email, formData.password, formData.name, profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Software Background */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Software Background
          </label>
          <div className="space-y-2">
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="softwareBackground"
                  value={level}
                  checked={formData.softwareBackground === level}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Programming Languages */}
        <div className="mb-4">
          <label htmlFor="programmingLanguages" className="block text-sm font-medium text-gray-700 mb-1">
            Programming Languages Known (comma separated)
          </label>
          <input
            type="text"
            id="programmingLanguages"
            name="programmingLanguages"
            value={formData.programmingLanguages}
            onChange={handleChange}
            placeholder="e.g., Python, C++, JavaScript"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Separate multiple languages with commas</p>
        </div>
        
        {/* Robotics Experience */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Robotics Experience
          </label>
          <div className="space-y-2">
            {['none', 'simulation-only', 'real hardware'].map(exp => (
              <label key={exp} className="flex items-center">
                <input
                  type="radio"
                  name="roboticsExperience"
                  value={exp}
                  checked={formData.roboticsExperience === exp}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">
                  {exp === 'none' && 'No experience'}
                  {exp === 'simulation-only' && 'Simulation only'}
                  {exp === 'real hardware' && 'Real hardware'}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Hardware Access */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hardware Access
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['GPU', 'Jetson', 'Robot kits', 'None'].map(hw => (
              <label key={hw} className="flex items-center">
                <input
                  type="checkbox"
                  value={hw.toLowerCase()}
                  checked={formData.hardwareAccess.includes(hw.toLowerCase())}
                  onChange={() => handleMultiSelectChange(hw.toLowerCase())}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{hw}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;