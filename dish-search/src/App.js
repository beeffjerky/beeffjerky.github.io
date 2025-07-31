import React, { useEffect, useState } from 'react';

function App() {
  const [dishList, setDishList] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);

  // Load dish list
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/dish_list.txt')
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        setDishList(lines);
      });
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (!query) return setSuggestions([]);
    const filtered = dishList.filter(dish =>
      dish.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 10));
  }, [query, dishList]);

  // Handle dish selection
  const handleSelectDish = (dish) => {
    setQuery(dish);
    setSelectedDish(dish);
    setSuggestions([]);
    setExpandedRestaurant(null);

    // Load restaurant data and filter
    fetch(process.env.PUBLIC_URL + '/example.json')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
      });
  };

  const toggleRestaurant = (name) => {
    setExpandedRestaurant(prev => (prev === name ? null : name));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Dish Search</h1>

      <input
        type="text"
        placeholder="Type a dish name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          fontSize: '1.2rem',
          width: '100%',
          padding: '0.5rem',
          border: '1px solid black',
          borderRadius: '4px'
        }}
      />

      {suggestions.length > 0 && (
        <ul style={{
          listStyleType: 'none',
          paddingLeft: 0,
          marginTop: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((dish, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectDish(dish)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              {dish}
            </li>
          ))}
        </ul>
      )}

      {selectedDish && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Restaurants serving: <em>{selectedDish}</em></h2>
          {restaurants.length === 0 && <p>No results found.</p>}
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {restaurants.map((rest, idx) => (
              <li key={idx} style={{ marginBottom: '1rem' }}>
                <div
                  onClick={() => toggleRestaurant(rest.name)}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <strong>{rest.name}</strong><br />
                  📍 {rest.address}<br />
                  ⭐ {rest.stars} | 😊 Sentiment: {rest.sentiment}
                </div>
                {expandedRestaurant === rest.name && (
  <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
    <h4 style={{ marginBottom: '0.5rem' }}>🍽 {selectedDish} Reviews</h4>
    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
      {rest.reviews.map((rev, i) => (
        <li key={i} style={{ marginBottom: '0.5rem' }}>
          ⭐ {rev.stars} — {rev.text}
        </li>
      ))}
    </ul>
  </div>
)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;