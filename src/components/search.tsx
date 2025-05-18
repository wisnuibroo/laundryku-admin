import { Icon } from '@iconify/react';
import React from 'react';

interface SearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Search({ value, onChange }: SearchProps) {
  return (
    <div className="w-full md:w-1/4 ">
      <form className="flex items-center"> 
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon icon="circum:search" className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="search"
            id="simple-search"
            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white "
            placeholder="Cari..."
            required
            value={value}
            onChange={onChange}
          />
        </div>
      </form>
    </div>
  );
}
