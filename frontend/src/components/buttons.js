import { Link } from 'react-router-dom';

function DefaultBtn({ tag = 'button', to = '', text = 'Default', className = '' }) {
  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function DarkBtn({ tag = 'button', to = '', text = 'Dark', className = '' }) {
  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function GreenBtn({ tag = 'button', to = '', text = 'Green', className = '' }) {
  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function RedBtn({ tag = 'button', to = '', text = 'Red', className = '' }) {
  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function YellowBtn({ tag = 'button', to = '', text = 'Yellow', className = '' }) {
  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900 ${className}`}
      >
        {text}
      </button>
    );
  }
}

function PurpleBtn({ tag = 'button', to = '', text = 'Purple', className = '' }) {
  if (tag === 'Link') {
    return (
      <Link
        to={to}
        className={`text-purple-700 hover:text-white border border-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-purple-400 dark:text-purple-400 dark:hover:text-white dark:hover:bg-purple-500 dark:focus:ring purple-900 ${className}`}
      >
        {text}
      </Link>
    );
  } else if (tag === 'a') {
    return (
      <a
        href={to}
        className={`text-purple-700 hover:text-white border border-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-purple-400 dark:text-purple-400 dark:hover:text-white dark:hover:bg-purple-500 dark:focus:ring-purple-900 ${className}`}
      >
        {text}
      </a>
    );
  } else {
    return (
      <button
        type="button"
        className={`text-purple-700 hover:text-white border border-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg px-5 py-2.5 text-center mb-2 dark:border-purple-400 dark:text-purple-400 dark:hover:text-white dark:hover:bg-purple-500 dark:focus:ring-purple-900 ${className}`}
      >
        {text}
      </button>
    );
  }
}

export { DefaultBtn, DarkBtn, GreenBtn, RedBtn, YellowBtn, PurpleBtn };