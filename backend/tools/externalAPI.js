// tools/externalAPI.js

const Client = require('../models/client');
const Order = require('../models/order');
const Course = require('../models/course');

const ExternalAPI = {
  // 🧾 1. Create a new client enquiry
  async createClient({ name, email, phone }) {
    const existing = await Client.findOne({ $or: [{ email }, { phone }] });
    if (existing) return { success: false, message: 'Client already exists.', client: existing };

    const newClient = await Client.create({ name, email, phone });
    return { success: true, message: 'Client enquiry created.', client: newClient };
  },

  // 🛒 2. Create a new order from client + service info
  async createOrder({ clientIdentifier, courseTitle }) {
    // Find client
    const client = await Client.findOne({
      $or: [
        { name: new RegExp(clientIdentifier, 'i') },
        { email: new RegExp(clientIdentifier, 'i') },
        { phone: new RegExp(clientIdentifier, 'i') }
      ]
    });

    if (!client) return { success: false, message: 'Client not found.' };

    // Find course
    const course = await Course.findOne({ title: new RegExp(courseTitle, 'i') });
    if (!course) return { success: false, message: 'Course not found.' };

    // Create order
    const newOrder = await Order.create({
      clientId: client._id,
      courseId: course._id,
      amount: 5000, // Default mock price
      status: 'pending'
    });

    return {
      success: true,
      message: `Order created for ${client.name} for course "${course.title}".`,
      order: newOrder
    };
  }
};

module.exports = ExternalAPI;
