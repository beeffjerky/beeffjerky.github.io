import React, { useEffect, useState } from 'react';

function App() {
  const [dishList, setDishList] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Load dish list on first render
  useEffect(() => {
    fetch('/chinese.txt')
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        setDishList(lines);
      });
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    if (query.length === 0) {
      setSuggestions([]);
    } else {
      const filtered = dishList.filter((dish) =>
        dish.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10)); // Limit to top 10 suggestions
    }
  }, [query, dishList]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Dish Search</h1>
      <input
        type="text"
        placeholder="Type a dish name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ fontSize: '1.2rem', width: '100%', padding: '0.5rem' }}
      />
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {suggestions.map((dish, idx) => (
          <li key={idx} style={{ padding: '0.25rem 0' }}>
            {dish}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;