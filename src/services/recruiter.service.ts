import prisma from "../prisma/client";

export const getRecruiterProfile = async (userId: string) => {
  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      }
    },
  });

  return profile;
};


