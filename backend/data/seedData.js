// data/seedData.js
require('dotenv').config();
const mongoose = require('mongoose');

const Client = require('../models/client');
const Order = require('../models/order');
const Payment = require('../models/payment');
const Course = require('../models/course');
const Class = require('../models/class');
const Attendance = require('../models/attendance');

const MONGO_URI = process.env.MONGO_URI ; 

async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('✅ Connected to MongoDB. Seeding data...');

  await Promise.all([
    Client.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Course.deleteMany({}),
    Class.deleteMany({}),
    Attendance.deleteMany({})
  ]);

  const clients = await Client.insertMany([
    { name: 'Priya Sharma', email: 'priya@gmail.com', phone: '9876543210' },
    { name: 'Amit Verma', email: 'amit@gmail.com', phone: '8765432109' }
  ]);

  const courses = await Course.insertMany([
    { title: 'Yoga Beginner', description: 'Intro to Yoga', instructor: 'Anjali Mehra' },
    { title: 'Pilates Advanced', description: 'Advanced Pilates course', instructor: 'Rahul Joshi' }
  ]);

  const classes = await Class.insertMany([
    { courseId: courses[0]._id, instructor: 'Anjali Mehra', scheduledAt: new Date(), duration: 60 },
    { courseId: courses[1]._id, instructor: 'Rahul Joshi', scheduledAt: new Date(Date.now() + 86400000), duration: 60 }
  ]);

  const orders = await Order.insertMany([
    { clientId: clients[0]._id, courseId: courses[0]._id, status: 'paid', amount: 5000 },
    { clientId: clients[1]._id, courseId: courses[1]._id, status: 'pending', amount: 6000 }
  ]);

  const payments = await Payment.insertMany([
    { orderId: orders[0]._id, amountPaid: 5000, method: 'UPI' }
  ]);

  const attendance = await Attendance.insertMany([
    { classId: classes[0]._id, clientId: clients[0]._id, attended: true },
    { classId: classes[1]._id, clientId: clients[1]._id, attended: false }
  ]);

  console.log('🎉 Data seeded successfully.');
  mongoose.disconnect();
}

seed();
