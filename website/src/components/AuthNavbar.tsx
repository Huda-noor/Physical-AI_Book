import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '../contexts/AuthContext';

const AuthNavbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { siteConfig } = useDocusaurusContext();

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
              <Link 
                className="dropdown__link" 
                to="/api/auth/sign-out"
                onClick={(e) => {
                  e.preventDefault();
                  // This would call the signOut function from the context
                  // For now, we'll handle it in the profile page
                }}
              >
                Sign Out
              </Link>
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