import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiMoreVertical } from 'react-icons/fi';

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div className="flex justify-between items-center bg-black px-3 py-3 sticky top-0 z-10">
        <Link to='/'>
          <FiHome className="text-white p-1 text-3xl hover:ring-4 hover:ring-gray-700 rounded" />
        </Link>
        <Link to='/'>
          <img src="/logo.png" className="aspect-auto w-12" alt="" />
        </Link>
        <div ref={dropdownRef}>
          <Link onClick={toggleDropdown}>
            <FiMoreVertical className="text-white text-3xl p-1 hover:ring-4 hover:ring-gray-700 rounded" />
          </Link>
          {isOpen && (
            <div className="absolute top-[101%] right-3 bg-black text-gray-100 shadow-md rounded text-sm p-2">
              <div className="cursor-pointer hover:bg-gray-700 p-2 rounded">
                <Link to="/about">About</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Nav;