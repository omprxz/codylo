import { Link } from 'react-router-dom';
import { FiHome, FiMoreVertical } from 'react-icons/fi';

function Nav() {
  return(
    <>
    <div className="flex justify-between items-center bg-black px-3 py-3 sticky top-0 z-10">
      <Link to='/'>
        <FiHome className="text-white p-1 text-3xl hover:ring-4 hover:ring-gray-700 rounded" />
      </Link>
      <Link to='/'>
        <img src="/logo.png" className="aspect-auto w-12" alt="" />
      </Link>
      <Link>
        <FiMoreVertical className="text-white text-3xl p-1 hover:ring-4 hover:ring-gray-700 rounded" />
      </Link>
    </div>
    </>
    );
}

export default Nav;