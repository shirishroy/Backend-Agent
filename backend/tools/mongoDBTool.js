// tools/mongoDBTool.js

const Client = require('../models/client');
const Order = require('../models/order');
const Payment = require('../models/payment');
const Course = require('../models/course');
const Class = require('../models/class');
const Attendance = require('../models/attendance');

const MongoDBTool = {
  // 🔍 1. Find Client by name, email, or phone
  async findClient(query) {
    return Client.findOne({
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { phone: new RegExp(query, 'i') }
      ]
    });
  },

  // 📦 2. Get Orders by clientId or orderId
  async getOrders({ clientId, orderId, status }) {
    const filter = {};
    if (clientId) filter.clientId = clientId;
    if (orderId) filter._id = orderId;
    if (status) filter.status = status;

    return Order.find(filter).populate('clientId courseId');
  },

  // 💰 3. Get Payments by orderId
  async getPayments(orderId) {
    return Payment.find({ orderId });
  },

  // 📘 4. Get all courses or filter by status/instructor
  async getCourses({ instructor, status }) {
    const filter = {};
    if (instructor) filter.instructor = new RegExp(instructor, 'i');
    if (status) filter.status = status;

    return Course.find(filter);
  },

  // 📅 5. Get upcoming classes
  async getUpcomingClasses() {
    return Class.find({ scheduledAt: { $gte: new Date() } }).populate('courseId');
  },

  // 📈 6. Revenue Calculation
  async calculateTotalRevenue() {
    const payments = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    return payments[0]?.total || 0;
  },

  // 💸 7. Outstanding Dues
  async getPendingPayments() {
    return Order.find({ status: 'pending' }).populate('clientId courseId');
  },

  // 👥 8. Active vs Inactive Clients
  async getClientStats() {
    const total = await Client.countDocuments();
    const activeIds = await Order.distinct('clientId');
    const active = activeIds.length;
    const inactive = total - active;
    return { total, active, inactive };
  },

  // 🎂 9. Birthday Reminders (Mocked via createdAt date for now)
  async getBirthdaysThisMonth() {
    const now = new Date();
    const month = now.getMonth();
    return Client.find({
      createdAt: {
        $gte: new Date(now.getFullYear(), month, 1),
        $lt: new Date(now.getFullYear(), month + 1, 1)
      }
    });
  },

  // 📊 10. Enrollment Trends (by course)
  async getEnrollmentTrends() {
    return Order.aggregate([
      {
        $group: {
          _id: '$courseId',
          totalEnrolled: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          courseTitle: '$course.title',
          totalEnrolled: 1
        }
      },
      { $sort: { totalEnrolled: -1 } }
    ]);
  },

  // 🎯 11. Attendance % by class
  async getAttendanceStats(courseTitle) {
    const course = await Course.findOne({ title: new RegExp(courseTitle, 'i') });
    if (!course) return [];

    const classes = await Class.find({ courseId: course._id });
    const results = [];

    for (const cls of classes) {
      const total = await Attendance.countDocuments({ classId: cls._id });
      const attended = await Attendance.countDocuments({ classId: cls._id, attended: true });
      const percentage = total ? (attended / total) * 100 : 0;

      results.push({
        classId: cls._id,
        instructor: cls.instructor,
        scheduledAt: cls.scheduledAt,
        attendancePercentage: percentage.toFixed(2)
      });
    }

    return results;
  }
};

module.exports = MongoDBTool;
