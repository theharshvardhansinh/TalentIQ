import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['student', 'volunteer', 'admin'],
        default: 'student',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
