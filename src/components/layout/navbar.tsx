import React from 'react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate }) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 
              className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => user && onNavigate('list')}
            >
              Simple Blogsite
            </h1>
            {user && (
              <div className="flex gap-1">
                <button
                  onClick={() => onNavigate('list')}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  All Posts
                </button>
                <button
                  onClick={() => onNavigate('create')}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  Write
                </button>
              </div>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {user.isGuest ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Guest
                    </span>
                    Anonymous
                  </span>
                ) : (
                  <span>{user.email}</span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="text-sm px-3 py-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;