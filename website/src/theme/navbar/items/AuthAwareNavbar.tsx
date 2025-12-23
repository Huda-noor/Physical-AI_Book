import React from 'react';
import NavbarItem from '@theme/NavbarItem';
import { useAuth } from '../../../contexts/AuthContext';

const AuthAwareNavbar = () => {
  const { user, isAuthenticated, signOut } = useAuth();

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut();
  };

  return (
    <div className="navbar__item navbar__link dropdown dropdown--hoverable dropdown--right">
      <span className="navbar__link">
        {isAuthenticated ? (user?.name || user?.email) : 'Account'}
      </span>
      <ul className="dropdown__menu">
        {isAuthenticated ? (
          <>
            <li>
              <a className="dropdown__link" href="/profile">
                Profile
              </a>
            </li>
            <li>
              <a className="dropdown__link" href="#" onClick={handleSignOut}>
                Sign Out
              </a>
            </li>
          </>
        ) : (
          <>
            <li>
              <a className="dropdown__link" href="/signin">
                Sign In
              </a>
            </li>
            <li>
              <a className="dropdown__link" href="/signup">
                Sign Up
              </a>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default AuthAwareNavbar;