import { Link } from 'react-router-dom';

function DefaultBtn({ tag = 'button', to = '', text = 'Default', className = '' }) {
  const baseClasses = `border focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2.5 text-center mb-2`;

  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`${baseClasses} border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 focus:ring-blue-800 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`${baseClasses} border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 focus:ring-blue-800 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`${baseClasses} border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 focus:ring-blue-800 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function DarkBtn({ tag = 'button', to = '', text = 'Dark', className = '' }) {
  const baseClasses = `border focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2.5 text-center mb-2`;

  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`${baseClasses} border-gray-600 text-gray-400 hover:text-white hover:bg-gray-600 focus:ring-gray-800 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`${baseClasses} border-gray-600 text-gray-400 hover:text-white hover:bg-gray-600 focus:ring-gray-800 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`${baseClasses} border-gray-600 text-gray-400 hover:text-white hover:bg-gray-600 focus:ring-gray-800 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function GreenBtn({ tag = 'button', to = '', text = 'Green', className = '' }) {
  const baseClasses = `border focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2.5 text-center mb-2`;

  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`${baseClasses} border-green-500 text-green-500 hover:text-white hover:bg-green-600 focus:ring-green-800 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`${baseClasses} border-green-500 text-green-500 hover:text-white hover:bg-green-600 focus:ring-green-800 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`${baseClasses} border-green-500 text-green-500 hover:text-white hover:bg-green-600 focus:ring-green-800 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function RedBtn({ tag = 'button', to = '', text = 'Red', className = '' }) {
  const baseClasses = `border focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2.5 text-center mb-2`;

  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`${baseClasses} border-red-500 text-red-500 hover:text-white hover:bg-red-600 focus:ring-red-900 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`${baseClasses} border-red-500 text-red-500 hover:text-white hover:bg-red-600 focus:ring-red-900 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`${baseClasses} border-red-500 text-red-500 hover:text-white hover:bg-red-600 focus:ring-red-900 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function YellowBtn({ tag = 'button', to = '', text = 'Yellow', className = '' }) {
  const baseClasses = `border focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2.5 text-center mb-2`;

  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`${baseClasses} border-yellow-300 text-yellow-300 hover:text-white hover:bg-yellow-400 focus:ring-yellow-900 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`${baseClasses} border-yellow-300 text-yellow-300 hover:text-white hover:bg-yellow-400 focus:ring-yellow-900 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`${baseClasses} border-yellow-300 text-yellow-300 hover:text-white hover:bg-yellow-400 focus:ring-yellow-900 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function PurpleBtn({ tag = 'button', to = '', text = 'Purple', className = '' }) {
  const baseClasses = `border focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2.5 text-center mb-2`;

  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`${baseClasses} border-purple-400 text-purple-400 hover:text-white hover:bg-purple-500 focus:ring-purple-900 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`${baseClasses} border-purple-400 text-purple-400 hover:text-white hover:bg-purple-500 focus:ring-purple-900 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`${baseClasses} border-purple-400 text-purple-400 hover:text-white hover:bg-purple-500 focus:ring-purple-900 ${className}`}
      >
        {text}
      </button>
    );
  }
}

export { DefaultBtn, DarkBtn, GreenBtn, RedBtn, YellowBtn, PurpleBtn };