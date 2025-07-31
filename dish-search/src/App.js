import React, { useEffect, useState } from 'react';

function App() {
  const [dishList, setDishList] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [lastKey, setLastKey] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // Load dish list
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/dish_list.txt')
      .then(res => res.text())
      .then(text => {
        const lines = text
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => {
            const [name, count] = line.split(',');
            return { name: name.trim(), count: parseInt(count, 10) };
          });
        setDishList(lines);
      });
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (!query) return setSuggestions([]);
    const filtered = dishList.filter(dish =>
      dish.name.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 10));
  }, [query, dishList]);

  const handleSelectDish = (dish) => {
    setQuery(dish);
    setSelectedDish(dish);
    setSuggestions([]);
    setExpandedRestaurant(null);
    setLastKey(null);
    setRestaurants([]);

    const pageSize = 10;
    const url = `https://qiuyj33fo8.execute-api.us-east-2.amazonaws.com/dishsearch?dish=${encodeURIComponent(dish)}&size=${pageSize}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRestaurants(data.results || []);
        setLastKey(data.lastKey || null);
      })
      .catch(err => console.error("API error:", err));
  };

  const fetchNextPage = () => {
    if (!lastKey || !selectedDish) return;

    setLoadingMore(true);

    const pageSize = 10;
    const url = `https://qiuyj33fo8.execute-api.us-east-2.amazonaws.com/dishsearch?dish=${encodeURIComponent(selectedDish)}&size=${pageSize}&lastKey=${encodeURIComponent(lastKey)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRestaurants(prev => [...prev, ...(data.results || [])]);
        setLastKey(data.lastKey || null);
      })
      .catch(err => console.error("Pagination error:", err))
      .finally(() => setLoadingMore(false));
  };

  const toggleRestaurant = (name) => {
    setExpandedRestaurant(prev => (prev === name ? null : name));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Chinese Dish Restaurant Suggestion Search</h1>
      <h2>Type a Chinese dish and get a number of suggestions based on review sentiment. </h2>
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
              onClick={() => handleSelectDish(dish.name)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              {dish.name} ({dish.count})
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
                  ⭐ {rest.stars} | 😊 Sentiment: {rest.sentiment.toFixed(4)} | 📊 Dish Mentions: {rest.mentions}
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
            {lastKey && (
              <button
                onClick={fetchNextPage}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  cursor: 'pointer'
                }}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;