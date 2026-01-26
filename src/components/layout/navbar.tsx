import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Profile } from '../../types';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/themeSlice';

interface NavbarProps {
  user: User | null;
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, profile, onLogout, onNavigate }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <nav className={`border-b shadow-sm transition-colors duration-300 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 
              className={`text-xl font-semibold cursor-pointer transition-colors ${
                isDark 
                  ? 'text-gray-100 hover:text-gray-300' 
                  : 'text-gray-900 hover:text-gray-700'
              }`}
              onClick={() => user && onNavigate('list')}
            >
              Simple Blogsite
            </h1>
            {user && (
              <div className="flex gap-1">
                <button
                  onClick={() => onNavigate('list')}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  All Posts
                </button>
                <button
                  onClick={() => onNavigate('create')}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Write
                </button>
              </div>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-lg border transition-all duration-300 hover:scale-110 ${
                  isDark
                    ? 'border-gray-600 hover:border-blue-500 bg-gray-700'
                    : 'border-gray-300 hover:border-blue-500 bg-white'
                }`}
                aria-label="Toggle theme"
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                <span className="text-xl">
                  {isDark ? '☀️' : '🌙'}
                </span>
              </button>

              <button
                onClick={() => !user.isGuest && onNavigate('profile')}
                className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className={`text-sm text-left ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user.isGuest ? (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        Guest
                      </span>
                      <span>Anonymous</span>
                    </div>
                  ) : (
                    <div>
                      <div className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {profile?.username || user.email}
                      </div>
                    </div>
                  )}
                </div>
              </button>
              <button
                onClick={onLogout}
                className={`text-sm px-3 py-1.5 rounded transition-colors ${
                  isDark
                    ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
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