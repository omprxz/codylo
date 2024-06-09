import { Link } from 'react-router-dom';

function Nav() {
  return(
    <>
    <div className="flex justify-center bg-black py-3 sticky top-0">
      <Link to='/'>
        <img src="/logo.png" className="aspect-auto w-12" alt="" />
      </Link>
    </div>
    </>
    );
}

export default Nav;