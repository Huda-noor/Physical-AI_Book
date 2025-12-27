import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '../contexts/AuthContext';

const AuthNavbar: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { siteConfig } = useDocusaurusContext();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
      // Redirect to homepage after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="navbar__item navbar__link">
      {isAuthenticated ? (
        <div className="dropdown dropdown--right dropdown--align-end">
          <span className="navbar__link">
            {user?.name || user?.email}
          </span>
          <ul className="dropdown__menu">
            <li>
              <Link className="dropdown__link" to="/profile">
                Profile
              </Link>
            </li>
            <li>
              <a
                className="dropdown__link"
                href="#"
                onClick={handleSignOut}
              >
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      ) : (
        <div className="dropdown dropdown--right dropdown--align-end">
          <span className="navbar__link">Account</span>
          <ul className="dropdown__menu">
            <li>
              <Link className="dropdown__link" to="/signin">
                Sign In
              </Link>
            </li>
            <li>
              <Link className="dropdown__link" to="/signup">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuthNavbar;