import React from 'react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate }) => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 
              className="text-2xl font-bold cursor-pointer"
              onClick={() => user && onNavigate('list')}
            >
              BlogApp
            </h1>
            {user && (
              <div className="flex gap-4">
                <button
                  onClick={() => onNavigate('list')}
                  className="hover:text-blue-200 transition-colors"
                >
                  All Blogs
                </button>
                <button
                  onClick={() => onNavigate('create')}
                  className="hover:text-blue-200 transition-colors"
                >
                  Create Blog
                </button>
              </div>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.email}</span>
              <button
                onClick={onLogout}
                className="bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;