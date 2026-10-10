import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  role: 'hr' | 'candidate';
  name: string;
  company?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  location?: string;
  phone?: string;
  targetRole?: string;
  targetIndustry?: string;
  skills?: string[];
  degree?: string;
  fieldOfStudy?: string;
  university?: string;
  graduationYear?: string;
  yearsOfExperience?: number;
  expectedSalary?: string;
  jobType?: string;
  availability?: string;
  bio?: string;
  linkedIn?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['hr', 'candidate'], required: true },
  name: { type: String, required: true },
  company: { type: String },
  industry: { type: String },
  companySize: { type: String },
  website: { type: String },
  location: { type: String },
  phone: { type: String },
  targetRole: { type: String },
  targetIndustry: { type: String },
  skills: [{ type: String }],
  degree: { type: String },
  fieldOfStudy: { type: String },
  university: { type: String },
  graduationYear: { type: String },
  yearsOfExperience: { type: Number, default: 0 },
  expectedSalary: { type: String },
  jobType: { type: String },
  availability: { type: String },
  bio: { type: String },
  linkedIn: { type: String },
  portfolioUrl: { type: String },
  resumeUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);

export interface IJob extends Document {
  id: string;
  hrId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  degree?: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: Date;
  applicantsCount: number;
  industry?: string;
}

const JobSchema = new Schema<IJob>({
  id: { type: String, required: true, unique: true },
  hrId: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  salary: { type: String },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  skills: [{ type: String }],
  experience: { type: String },
  degree: { type: String },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  applicantsCount: { type: Number, default: 0 },
  industry: { type: String }
});

export const JobModel = mongoose.model<IJob>('Job', JobSchema);

export interface IApplication extends Document {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  appliedAt: Date;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  resumeUrl?: string;
  aiAnalysis?: string;
  resumeFeedback?: string;
  notes?: string;
}

const ApplicationSchema = new Schema<IApplication>({
  id: { type: String, required: true, unique: true },
  jobId: { type: String, required: true },
  candidateId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'],
    default: 'applied' 
  },
  appliedAt: { type: Date, default: Date.now },
  matchScore: { type: Number, required: true },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  resumeUrl: { type: String },
  aiAnalysis: { type: String },
  resumeFeedback: { type: String },
  notes: { type: String }
});

export const ApplicationModel = mongoose.model<IApplication>('Application', ApplicationSchema);

export interface IInterview extends Document {
  id: string;
  applicationId: string;
  hrId: string;
  candidateId: string;
  jobId: string;
  scheduledAt: Date;
  duration: number;
  mode: 'video' | 'phone' | 'onsite';
  platform?: 'google_meet' | 'zoom' | 'other';
  meetLink?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt: Date;
}

const InterviewSchema = new Schema<IInterview>({
  id: { type: String, required: true, unique: true },
  applicationId: { type: String, required: true },
  hrId: { type: String, required: true },
  candidateId: { type: String, required: true },
  jobId: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  mode: { type: String, enum: ['video', 'phone', 'onsite'], required: true },
  platform: { type: String, enum: ['google_meet', 'zoom', 'other'] },
  meetLink: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
});

export const InterviewModel = mongoose.model<IInterview>('Interview', InterviewSchema);

export interface INotification extends Document {
  id: string;
  userId: string;
  type: 'job_match' | 'status_update' | 'interview_scheduled' | 'application_received';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

const NotificationSchema = new Schema<INotification>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed }
});

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
