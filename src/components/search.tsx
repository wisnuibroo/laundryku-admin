import { Icon } from '@iconify/react';

export default function Search({ placeholder = "Cari..." }) {
  return (
    <div className="w-full md:w-1/4">
      <form className="flex items-center">
        <label htmlFor="simple-search" className="sr-only">Search</label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon icon="circum:search" className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="search"
            id="simple-search"
            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white "
            placeholder={placeholder}
            required
          />
        </div>
      </form>
    </div>
  );
}
