import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { AppDispatch, RootState } from '../../store';

interface NavbarProps {
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => onNavigate('list')}>
          Blog App
        </h1>
        {user && (
          <div className="flex gap-4 items-center">
            <span className="text-sm">{user.email}</span>
            <button
              onClick={() => onNavigate('create')}
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
            >
              Create Blog
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;