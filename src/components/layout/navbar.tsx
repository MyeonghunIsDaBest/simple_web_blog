import React from 'react';
import { User, Profile } from '../../types';

interface NavbarProps {
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, profile, onLogout, onNavigate }) => {
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
              <button
                onClick={() => !user.isGuest && onNavigate('profile')}
                className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="text-sm text-gray-600 text-left">
                  {user.isGuest ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Guest
                      </span>
                      <span>Anonymous</span>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-900">
                        {profile?.username || user.email}
                      </div>
                    </div>
                  )}
                </div>
              </button>
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