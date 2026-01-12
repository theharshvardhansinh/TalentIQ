import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    problemSlug: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
        default: 'Accepted', // Simplified for now
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
