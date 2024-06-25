import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar'

function TopLoader(){
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    let i = 0;
    let loaderInterval = setInterval(() => {
      setLoading(prevLoading => {
        if (prevLoading >= 100) {
          clearInterval(loaderInterval);
          return 0;
        }
        i++
        return prevLoading + 10*(i+1);
      });
    }, 100);
  }, [pathname]);
  
  return(
    <>
      <LoadingBar color='#f11946' progress={loading} onLoaderFinished={() => setLoading(0)} />
    </>
    )
  
}

export default TopLoader