import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean up existing data for a fresh seed
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.jobSeekerProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.user.deleteMany();
  
  // --- Admin User ---
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example1.com",
      password: await bcrypt.hash("admin", 10),
      roles: ["ADMIN"]
    }
  });

  console.log("✅ Created admin user:", admin.email);

  // --- Recruiter + Profile + Job ---
  const recruiterUser = await prisma.user.create({
    data: {
      name: "Recruiter Jane",
      email: "recruiter@example.com",
      password: await bcrypt.hash("recruiter123", 10),
      roles: ["RECRUITER"],
      recruiter: {
        create: {
          companyName: "Tech Corp",
          companyWebsite: "https://techcorp.com",
          description: "A fast-growing tech company",
          industry: "Software"
        }
      }
    },
    include: {
      recruiter: true
    }
  });

  console.log("✅ Created recruiter:", recruiterUser.email, "Company:", recruiterUser.recruiter?.companyName);

  const job = await prisma.job.create({
    data: {
      recruiterId: recruiterUser.recruiter!.id,
      title: "Frontend Developer",
      description: "React developer needed",
      requirements: "2+ years of experience in React",
      location: "Remote",
      salaryRange: "$80,000 - $100,000",
      category: "Software"
    }
  });

  console.log("✅ Created job:", job.title);

  // --- Job Seeker + Profile + Application + SavedJob ---
  const seekerUser = await prisma.user.create({
    data: {
      name: "Job Seeker John",
      email: "seeker@example.com",
      password: await bcrypt.hash("seeker123", 10),
      roles: ["JOB_SEEKER"],
      jobSeeker: {
        create: {
          bio: "Passionate about frontend development",
          location: "Sydney",
          skills: ["React", "TypeScript", "HTML", "CSS"],
          education: "BSc in Computer Science",
          experience: "2 years at Webify",
          resumeUrl: "https://example.com/resume/john.pdf"
        }
      }
    },
    include: {
      jobSeeker: true
    }
  });

  console.log("✅ Created job seeker:", seekerUser.email);

  await prisma.application.create({
    data: {
      jobId: job.id,
      jobSeekerId: seekerUser.jobSeeker!.id,
      coverLetter: "I'm very interested in this opportunity!"
    }
  });

  console.log("✅ Created application");

  await prisma.savedJob.create({
    data: {
      jobId: job.id,
      jobSeekerId: seekerUser.jobSeeker!.id
    }
  });

  console.log("✅ Created saved job");

  console.log("✅ Seeding complete!");
}

main()
  .catch(e => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
