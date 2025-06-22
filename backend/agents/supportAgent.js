// agents/supportAgent.js

const MongoDBTool = require('../tools/mongoDBTool');
const ExternalAPI = require('../tools/externalAPI');

const supportAgent = {
  async handleQuery(query) {
    query = query.toLowerCase();

    // 1️⃣ Classes this week
    if (query.includes('classes') && query.includes('this week')) {
      const classes = await MongoDBTool.getUpcomingClasses();
      return classes.map(c => ({
        course: c.courseId.title,
        instructor: c.instructor,
        scheduledAt: c.scheduledAt
      }));
    }

    // 2️⃣ Order status check by ID
    const orderIdMatch = query.match(/order\s*#?(\w+)/);
    if (query.includes('order') && query.includes('paid') && orderIdMatch) {
      const orderId = orderIdMatch[1];
      const orders = await MongoDBTool.getOrders({ orderId });
      if (orders.length === 0) return 'Order not found.';
      return `Order #${orderId} status: ${orders[0].status}`;
    }

    // 3️⃣ Create order for course and client
    if (query.includes('create') && query.includes('order')) {
      const clientMatch = query.match(/client\s(.+)/i);
      const courseMatch = query.match(/for\s(.+)\sfor/i);

      const courseTitle = courseMatch ? courseMatch[1] : null;
      const clientName = clientMatch ? clientMatch[1] : null;

      if (!courseTitle || !clientName)
        return 'Please specify both client name and course title.';

      const result = await ExternalAPI.createOrder({
        clientIdentifier: clientName.trim(),
        courseTitle: courseTitle.trim()
      });

      return result.message;
    }

    // 4️⃣ Retrieve payment info
    if (query.includes('payment') || query.includes('dues')) {
      const clientMatch = query.match(/for\s(.+)/i);
      if (!clientMatch) return 'Please specify the client.';

      const client = await MongoDBTool.findClient(clientMatch[1]);
      if (!client) return 'Client not found.';

      const orders = await MongoDBTool.getOrders({ clientId: client._id });
      let response = '';

      for (const order of orders) {
        const payments = await MongoDBTool.getPayments(order._id);
        const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const due = order.amount - totalPaid;

        response += `Order ${order._id}: Paid ₹${totalPaid}, Due ₹${due} (${order.status})\n`;
      }

      return response || 'No orders found.';
    }

    // 5️⃣ Client search by name/email/phone
    if (query.includes('client') && (query.includes('info') || query.includes('enrolled'))) {
      const match = query.match(/client\s(.+)/i);
      if (!match) return 'Please specify the client name/email/phone.';

      const client = await MongoDBTool.findClient(match[1]);
      if (!client) return 'Client not found.';

      return {
        name: client.name,
        email: client.email,
        enrolledServices: client.enrolledServices
      };
    }

    // 6️⃣ List upcoming courses or instructor filter
    if (query.includes('courses')) {
      const instructorMatch = query.match(/by\s(.+)/i);
      const courses = await MongoDBTool.getCourses({
        instructor: instructorMatch ? instructorMatch[1] : null
      });

      return courses.map(c => ({
        title: c.title,
        instructor: c.instructor,
        status: c.status
      }));
    }

    return 'Sorry, I could not understand your query. Try asking about classes, orders, payments, or clients.';
  }
};

module.exports = supportAgent;
