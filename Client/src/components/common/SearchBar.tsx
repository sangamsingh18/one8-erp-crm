import React, { useState } from 'react';

interface Props {
  onSearch: (q: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = 'Search...' }: Props) => {
  const [value, setValue] = useState('');
  return (
    <input
      className="search-bar"
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => { setValue(e.target.value); onSearch(e.target.value); }}
    />
  );
};

export default SearchBar;
