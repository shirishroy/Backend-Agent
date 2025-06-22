// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const suggestions = [
  "Create an order for Pilates for client Priya Sharma",
  "What classes are happening this week?",
  "Has order #12345 been paid?",
  "Tell me about the services available",
];

function App() {
  const [agent, setAgent] = useState('support');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);

  const sendQuery = async (text) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setQuery('');

    try {
      const payload =
        agent === 'gemini-support'
          ? { query: text, sessionId: 'shirish-001' }
          : { query: text };

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/${agent}`,
        payload
      );

      const responseText =
        typeof res.data.response === 'object'
          ? JSON.stringify(res.data.response, null, 2)
          : res.data.response;

      setMessages((prev) => [...prev, { role: 'agent', text: responseText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: '❌ Error communicating with backend' },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    await sendQuery(query.trim());
  };

  const handleSuggestionClick = async (s) => {
    await sendQuery(s);
  };

  return (
    <div className="App">
      <h1>🧠 Multi-Agent Chat</h1>

      <form onSubmit={handleSubmit}>
        <select value={agent} onChange={(e) => setAgent(e.target.value)}>
          <option value="support">Support Agent</option>
          <option value="dashboard">Dashboard Agent</option>
          <option value="gemini-support">Gemini Support Agent</option>
        </select>

        <input
          type="text"
          placeholder="Ask something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button type="submit">Send</button>
      </form>

      <div className="suggestions">
        <p><strong>💡 Suggestions:</strong></p>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => handleSuggestionClick(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`msg ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'Agent'}:</strong>
            <pre>{msg.text}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
