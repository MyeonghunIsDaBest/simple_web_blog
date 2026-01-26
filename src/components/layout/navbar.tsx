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
    <nav className={`sticky top-0 z-40 border-b backdrop-blur-lg transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900/90 border-gray-700/50' 
        : 'bg-white/90 border-gray-200/50'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6 md:gap-8">
            <h1 
              className={`text-xl md:text-2xl font-bold cursor-pointer transition-all duration-200 flex items-center gap-2 ${
                isDark 
                  ? 'text-gray-100 hover:text-blue-400' 
                  : 'text-gray-900 hover:text-blue-600'
              }`}
              onClick={() => user && onNavigate('list')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="hidden sm:inline">BlogHub</span>
            </h1>
            {user && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => onNavigate('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Posts
                </button>
                <button
                  onClick={() => onNavigate('create')}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md hover:shadow-lg`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Write
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile menu button */}
            {user && (
              <div className="md:hidden">
                <button
                  onClick={() => {/* Mobile menu functionality */}}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={handleThemeToggle}
              className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-110 ${
                isDark
                  ? 'border-gray-600 hover:border-blue-500 bg-gray-700/50'
                  : 'border-gray-300 hover:border-blue-500 bg-white/50'
              }`}
              aria-label="Toggle theme"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <span className="text-lg">
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </span>
            </button>

            {user && (
              <>
                <button
                  onClick={() => !user.isGuest && onNavigate('profile')}
                  className={`hidden sm:flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 hover:scale-105 ${
                    isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white ${
                    isDark ? 'bg-gradient-to-br from-gray-600 to-gray-700' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className={`text-sm text-left hidden lg:block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user.isGuest ? (
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                          isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                          Guest
                        </span>
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
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 ${
                    isDark
                      ? 'text-gray-300 hover:text-red-400 hover:bg-red-500/10'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;