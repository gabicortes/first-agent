import { prisma } from "../../../../prisma";

const TEST_USER_ID = "test-user";

export async function POST() {
  const profile = await prisma.userProfile.upsert({
    where: {
      userId: TEST_USER_ID,
    },
    update: {
      name: "Gabi",
      weightKg: 46,
    },
    create: {
      userId: TEST_USER_ID,
      name: "Gabi",
      weightKg: 46,
    },
  });

  return Response.json(profile);
}

export async function GET() {
  const profile = await prisma.userProfile.findUnique({
    where: {
      userId: TEST_USER_ID,
    },
  });

  return Response.json(profile);
}