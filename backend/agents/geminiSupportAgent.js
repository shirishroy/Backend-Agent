// agents/geminiSupportAgent.js
require('dotenv').config();
const MongoDBTool = require('../tools/mongoDBTool');
const ExternalAPI = require('../tools/externalAPI');
const { getSessionMemory, updateSessionMemory } = require('../utils/memoryStore');
const generateGeminiResponse = require('../helpers/geminiClient');

async function geminiSupportAgent(userPrompt, sessionId = 'default') {
  const prompt = userPrompt.trim();
  const lower = prompt.toLowerCase();

  const memory = getSessionMemory(sessionId);

  // ✅ Create Order
  if (lower.includes('create') && lower.includes('order')) {
    let courseTitle, clientName;
    const match = prompt.match(/for\s(.+)\sfor\sclient\s(.+)/i);

    if (match) {
      [, courseTitle, clientName] = match;
      updateSessionMemory(sessionId, {
        lastClient: clientName.trim(),
        lastCourse: courseTitle.trim()
      });
    } else {
      courseTitle = memory.lastCourse;
      clientName = memory.lastClient;
      if (!courseTitle || !clientName) {
        return 'Please specify course and client name, or refer to a previous reference.';
      }
    }

    const res = await ExternalAPI.createOrder({
      clientIdentifier: clientName,
      courseTitle
    });

    if (res.orderId) {
      updateSessionMemory(sessionId, { lastOrder: res.orderId });
    }

    return res.message;
  }

  // ✅ Order Status
  if (lower.includes('order') && lower.includes('paid')) {
    let orderId;
    const match = prompt.match(/order\s#?(\w+)/i);

    if (match) {
      orderId = match[1];
      updateSessionMemory(sessionId, { lastOrder: orderId });
    } else {
      orderId = memory.lastOrder;
      if (!orderId) return 'Please provide an order ID or refer to a previous order.';
    }

    const orders = await MongoDBTool.getOrders({ orderId });
    return orders.length
      ? `Order #${orderId} is ${orders[0].status}.`
      : 'Order not found.';
  }

  // ✅ Upcoming Classes
  if (lower.includes('classes') || lower.includes('upcoming')) {
    const classes = await MongoDBTool.getUpcomingClasses();
    if (!classes.length) return 'No upcoming classes found.';
    return classes
      .map(c => `${c.courseId.title} - ${c.instructor} - ${c.scheduledAt.toLocaleString()}`)
      .join('\n');
  }

  // 🧠 Gemini Fallback
  const fallback = await generateGeminiResponse(prompt);
  return fallback;
}

module.exports = geminiSupportAgent;
