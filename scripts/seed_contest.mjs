
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables *before* imports that use them
dotenv.config();

// Because we're running this as a standalone script, we need to import models directly.
// In Next.js, model registration is handled implicitly by file imports, but here we might need to be careful about re-compilation.

// We need to define schemas inline or import from models file. Importing is better but requires "type": "module" in package.json or using .mjs extension.
// The user has .js extension for models and "type": "module" likely (from `export default`).
// Let's assume we can import directly.

import User from '../models/User.js';
import Contest from '../models/Contest.js';
import Problem from '../models/Problem.js'; 

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB Connected');
  } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
  }
};

const seed = async () => {
    await connectDB();

    console.log('--- Cleaning up old test data (optional) ---');
    // Using a specific prefix to avoid improved data loss if run on prod, but for test, let's just create new users
    // Actually, let's delete users with specific email pattern if they exist to restart fresh
    await User.deleteMany({ email: { $regex: /test_student_\d+@example.com/ } });
    await Contest.deleteMany({ title: "Automated Test Contest" });
    // Keep problems for now if we want, or delete them. Let's create new ones.
    
    console.log('--- Creating Admin User (if not exists) ---');
    let admin = await User.findOne({ email: 'admin@talentiq.com' });
    if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        admin = await User.create({
            name: 'Admin User',
            email: 'admin@talentiq.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Created admin: admin@talentiq.com');
    } else {
        console.log('Admin already exists');
    }

    console.log('--- Creating 10 Test Students ---');
    const students = [];
    const passwordHash = await bcrypt.hash('password123', 10);

    for (let i = 1; i <= 10; i++) {
        const student = await User.create({
            name: `Test Student ${i}`,
            email: `test_student_${i}@example.com`,
            password: passwordHash,
            role: 'student'
        });
        students.push(student);
        console.log(`Created student: ${student.email}`);
    }

    console.log('--- Creating Contest Problems ---');
    const problem1 = await Problem.create({
        title: "Sum of Two Numbers",
        slug: "sum-of-two", // Ensure unique
        description: "Given two integers a and b, return their sum.",
        difficulty: "Easy",
        constraints: "1 <= a, b <= 100",
        inputFormat: "Two space-separated integers a and b.",
        outputFormat: "A single integer.",
        testCases: [
            { input: "1 2", output: "3", isPublic: true },
            { input: "10 20", output: "30", isPublic: true },
            { input: "100 200", output: "300", isPublic: false }
        ],
        tags: ["Math", "Basics"],
        createdBy: admin._id
    });

    const problem2 = await Problem.create({
        title: "Reverse a String",
        slug: "reverse-string",
        description: "Given a string S, return the reversed string.",
        difficulty: "Medium",
        constraints: "1 <= |S| <= 1000",
        inputFormat: "A single string S.",
        outputFormat: "The reversed string.",
        testCases: [
            { input: "hello", output: "olleh", isPublic: true },
            { input: "world", output: "dlrow", isPublic: false }
        ],
        tags: ["String"],
        createdBy: admin._id
    });

    console.log('Created problems');

    console.log('--- Creating Contest ---');
    // Set start time to 5 minutes ago so it's "ongoing"
    const startTime = new Date(Date.now() - 5 * 60 * 1000); 
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // Ends in 2 hours

    const contest = await Contest.create({
        title: "Automated Test Contest",
        description: "A contest created automatically for testing purposes.",
        startTime: startTime,
        endTime: endTime,
        questionCount: 2,
        createdBy: admin._id,
        status: 'ongoing',
        yearLevel: ['All'],
        problems: [problem1._id, problem2._id],
        registeredUsers: students.map(s => s._id)
    });

    console.log(`Created Contest: ${contest.title} (ID: ${contest._id})`);
    console.log(`Registered ${students.length} students to the contest.`);

    console.log('--- Done ---');
    process.exit(0);
};

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
