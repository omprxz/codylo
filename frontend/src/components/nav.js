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
      <div className="flex justify-between items-center bg-transparent px-5 py-3 sticky top-0 z-10">
        <Link className="text-white text-2xl" to='/'>
          <FiHome />
        </Link>
        <Link to='/' className='font-extrabold text-green-400 text-3xl'>
          Codylo
        </Link>
        <div ref={dropdownRef}>
          <FiMoreVertical className="text-white text-2xl" onClick={toggleDropdown} />
          {isOpen && (
            <div className="absolute top-[101%] right-3 bg-neutral-900 text-gray-100 shadow-md rounded text-sm p-2">
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