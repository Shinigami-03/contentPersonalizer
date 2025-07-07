import React, { useState } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatError(null);
    const userMessage = { sender: "user", text: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);

    const endpoint = chatInput.toLowerCase().startsWith("similar to ") ? "/similar" : "/ask";
    const queryText = chatInput.toLowerCase().startsWith("similar to ")
      ? chatInput.replace("similar to ", "")
      : chatInput;

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText })
      });
      if (!response.ok) throw new Error("Failed to get response from AI");
      const data = await response.json();
      const reply = endpoint === "/similar"
        ? `Movies similar to "${queryText}":\n\n` + data.recommendations.map(m => `${m.Title} (${m.Release_Date}) - ${m.Genre} | Rating: ${m.Rating}`).join("\n\n")
        : data.answer;

      setChatHistory((prev) => [...prev, { sender: "ai", text: reply }]);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
      setChatInput("");
    }
  };

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-title">Ask AI About Movies</h2>
      <div className="chat-history">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.sender}`}>
            <span className="chat-bubble">{msg.text}</span>
          </div>
        ))}
        {chatLoading && <div className="chat-loading">AI is typing...</div>}
      </div>
      <form onSubmit={handleChatSubmit} className="chat-form">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask a question or try: 'similar to Inception'..."
          className="chat-input"
          disabled={chatLoading}
        />
        <button type="submit" disabled={chatLoading || !chatInput.trim()} className="chat-send">Send</button>
      </form>
      {chatError && <div className="chat-error">{chatError}</div>}
    </div>
  );
};

export default Chatbot;