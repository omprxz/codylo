import './LoaderWavy.css';

function LoaderWavy({ className = '' }) {
  return (
    <div className={`loader ${className}`}></div>
  );
}

export default LoaderWavy;