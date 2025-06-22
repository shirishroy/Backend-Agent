// agents/dashboardAgent.js

const MongoDBTool = require('../tools/mongoDBTool');

const dashboardAgent = {
  async handleQuery(query) {
    query = query.toLowerCase();

    // 1️⃣ Revenue this month
    if (query.includes('revenue')) {
      const revenue = await MongoDBTool.calculateTotalRevenue();
      return `💰 Total Revenue: ₹${revenue}`;
    }

    // 2️⃣ Outstanding payments
    if (query.includes('outstanding') || query.includes('pending payments')) {
      const pendingOrders = await MongoDBTool.getPendingPayments();
      if (!pendingOrders.length) return '🎉 No pending payments.';

      return pendingOrders.map(order => ({
        client: order.clientId.name,
        course: order.courseId.title,
        amount: order.amount
      }));
    }

    // 3️⃣ Active vs Inactive Clients
    if (query.includes('inactive clients') || query.includes('active clients')) {
      const stats = await MongoDBTool.getClientStats();
      return `👥 Total: ${stats.total} | Active: ${stats.active} | Inactive: ${stats.inactive}`;
    }

    // 4️⃣ Birthday reminders
    if (query.includes('birthday')) {
      const clients = await MongoDBTool.getBirthdaysThisMonth();
      if (!clients.length) return 'No birthdays this month 🎂';
      return clients.map(c => `${c.name} (${c.email})`);
    }

    // 5️⃣ Enrollment trends
    if (query.includes('enrollment') || query.includes('trending')) {
      const trends = await MongoDBTool.getEnrollmentTrends();
      return trends.map(t => `${t.courseTitle}: ${t.totalEnrolled} enrolled`);
    }

    // 6️⃣ Highest enrolled course
    if (query.includes('highest enrollment') || query.includes('top course')) {
      const trends = await MongoDBTool.getEnrollmentTrends();
      const top = trends[0];
      if (!top) return 'No enrollment data available.';
      return `🔥 Top Course: ${top.courseTitle} (${top.totalEnrolled} enrolled)`;
    }

    // 7️⃣ Attendance % by course
    const attendanceMatch = query.match(/attendance.*for\s(.+)/i);
    if (attendanceMatch) {
      const courseTitle = attendanceMatch[1];
      const stats = await MongoDBTool.getAttendanceStats(courseTitle);
      if (!stats.length) return `No attendance data for ${courseTitle}.`;

      return stats.map(s => ({
        instructor: s.instructor,
        date: s.scheduledAt.toLocaleDateString(),
        attendance: `${s.attendancePercentage}%`
      }));
    }

    // 8️⃣ Drop-off (clients who stopped attending — simplified)
    if (query.includes('drop-off')) {
      const all = await MongoDBTool.getPendingPayments(); // Simplified proxy for drop-offs
      return all.map(order => `${order.clientId.name} (${order.courseId.title})`);
    }

    return '❓ I did not understand. Try asking about revenue, attendance, or client stats.';
  }
};

module.exports = dashboardAgent;
