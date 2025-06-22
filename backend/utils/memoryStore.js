// utils/memoryStore.js

// Simple in-memory session context store
const memory = {};

// Get memory for a session (or default)
function getSessionMemory(sessionId) {
  if (!memory[sessionId]) {
    memory[sessionId] = {
      lastClient: null,
      lastCourse: null,
      lastOrder: null,
    };
  }
  return memory[sessionId];
}

// Update memory
function updateSessionMemory(sessionId, updates) {
  memory[sessionId] = {
    ...getSessionMemory(sessionId),
    ...updates
  };
}

module.exports = {
  getSessionMemory,
  updateSessionMemory,
};
