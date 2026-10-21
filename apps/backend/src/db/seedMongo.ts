import { UserModel, JobModel, ApplicationModel, InterviewModel, NotificationModel } from '../models/mongoModels';
import { users, jobs, applications, interviews, notifications } from '../data/demoData';

/**
 * Safely ensure all baseline demo data exists in MongoDB Atlas without deleting or
 * overwriting any existing or newly entered user details.
 */
export async function seedMongoDB(): Promise<void> {
  try {
    // 1. Users
    let usersInserted = 0;
    for (const u of users) {
      const exists = await UserModel.findOne({ id: u.id });
      if (!exists) {
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
          createdAt: new Date(u.createdAt),
        });
        usersInserted++;
      }
    }
    if (usersInserted > 0) {
      console.log(`✅ Seeded ${usersInserted} baseline demo users into MongoDB Atlas`);
    }

    // 2. Jobs
    let jobsInserted = 0;
    for (const j of jobs) {
      const exists = await JobModel.findOne({ id: j.id });
      if (!exists) {
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
          industry: j.industry,
        });
        jobsInserted++;
      }
    }
    if (jobsInserted > 0) {
      console.log(`✅ Seeded ${jobsInserted} baseline demo jobs into MongoDB Atlas`);
    }

    // 3. Applications
    let appsInserted = 0;
    for (const a of applications) {
      const exists = await ApplicationModel.findOne({ id: a.id });
      if (!exists) {
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
          notes: a.notes,
        });
        appsInserted++;
      }
    }
    if (appsInserted > 0) {
      console.log(`✅ Seeded ${appsInserted} baseline demo applications into MongoDB Atlas`);
    }

    // 4. Interviews
    let intsInserted = 0;
    for (const i of interviews) {
      const exists = await InterviewModel.findOne({ id: i.id });
      if (!exists) {
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
          createdAt: new Date(),
        });
        intsInserted++;
      }
    }
    if (intsInserted > 0) {
      console.log(`✅ Seeded ${intsInserted} baseline demo interviews into MongoDB Atlas`);
    }

    // 5. Notifications
    let notifsInserted = 0;
    for (const n of notifications) {
      const exists = await NotificationModel.findOne({ id: n.id });
      if (!exists) {
        let route = '/applications';
        const nType = n.type as string;
        if (nType === 'job_match' || nType === 'future_opportunity') route = '/jobs';
        else if (nType === 'interview_scheduled') route = '/interviews';

        await NotificationModel.create({
          id: n.id,
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: new Date(n.createdAt),
          metadata: (n as any).metadata || { jobId: (n as any).jobId, applicationId: (n as any).applicationId },
          route,
        });
        notifsInserted++;
      }
    }
    if (notifsInserted > 0) {
      console.log(`✅ Seeded ${notifsInserted} baseline demo notifications into MongoDB Atlas`);
    }

    console.log('🎉 MongoDB Atlas synchronization complete — demo records preserved, user updates active.');
  } catch (err: any) {
    console.warn('⚠️ Seeding synchronization skipped or deferred:', err.message);
  }
}
