import { connectMongoDB } from '../config/database';
import { UserModel, JobModel, ApplicationModel, InterviewModel, NotificationModel } from '../models/mongoModels';
import { users, jobs, applications, interviews, notifications } from '../data/demoData';

export async function seedMongoDB(): Promise<void> {
  await connectMongoDB();

  const userCount = await UserModel.countDocuments();
  if (userCount === 0) {
    for (const u of users) {
      await UserModel.create({
        id: u.id,
        email: u.email,
        password: u.passwordHash,
        role: u.role,
        name: u.name,
        company: u.company,
        industry: u.industry,
        companySize: u.companySize,
        website: u.website,
        location: u.location,
        phone: u.phone,
        targetRole: u.targetRole,
        targetIndustry: u.targetIndustry,
        skills: u.skills,
        degree: u.degree,
        fieldOfStudy: u.fieldOfStudy,
        university: u.university,
        graduationYear: u.graduationYear,
        yearsOfExperience: u.yearsOfExperience || 0,
        expectedSalary: u.expectedSalary,
        jobType: u.jobType,
        availability: u.availability,
        bio: u.bio,
        linkedIn: u.linkedIn,
        portfolioUrl: u.portfolioUrl,
        resumeUrl: u.resumeUrl,
        createdAt: new Date(u.createdAt)
      });
    }
    console.log(`✅ Seeded ${users.length} Users into MongoDB Atlas`);
  }

  const jobCount = await JobModel.countDocuments();
  if (jobCount === 0) {
    for (const j of jobs) {
      await JobModel.create({
        id: j.id,
        hrId: j.hrId,
        title: j.title,
        company: j.company,
        location: j.location,
        type: j.type,
        salary: j.salary,
        description: j.description,
        requirements: j.requirements,
        skills: j.skills,
        experience: j.experience,
        degree: j.degree,
        status: j.status,
        createdAt: new Date(j.createdAt),
        applicantsCount: j.applicantsCount,
        industry: j.industry
      });
    }
    console.log(`✅ Seeded ${jobs.length} Jobs into MongoDB Atlas`);
  }

  const appCount = await ApplicationModel.countDocuments();
  if (appCount === 0) {
    for (const a of applications) {
      await ApplicationModel.create({
        id: a.id,
        jobId: a.jobId,
        candidateId: a.candidateId,
        status: a.status,
        appliedAt: new Date(a.appliedAt),
        matchScore: a.matchScore,
        matchedSkills: a.matchedSkills,
        missingSkills: a.missingSkills,
        resumeUrl: a.resumeUrl,
        aiAnalysis: a.aiAnalysis,
        resumeFeedback: a.resumeFeedback,
        notes: a.notes
      });
    }
    console.log(`✅ Seeded ${applications.length} Applications into MongoDB Atlas`);
  }

  const intCount = await InterviewModel.countDocuments();
  if (intCount === 0) {
    for (const i of interviews) {
      await InterviewModel.create({
        id: i.id,
        applicationId: i.applicationId,
        hrId: i.hrId,
        candidateId: i.candidateId,
        jobId: i.jobId,
        scheduledAt: new Date(i.scheduledAt),
        duration: i.duration,
        mode: i.mode,
        platform: i.platform,
        meetLink: i.meetLink,
        notes: i.notes,
        status: i.status,
        createdAt: new Date()
      });
    }
    console.log(`✅ Seeded ${interviews.length} Interviews into MongoDB Atlas`);
  }

  const notifCount = await NotificationModel.countDocuments();
  if (notifCount === 0) {
    for (const n of notifications) {
      await NotificationModel.create({
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: new Date(n.createdAt),
        metadata: (n as any).metadata
      });
    }
    console.log(`✅ Seeded ${notifications.length} Notifications into MongoDB Atlas`);
  }

  console.log('🎉 MongoDB Atlas Seeding Complete!');
}
