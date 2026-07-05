/**
 * Seeds the database with:
 *  - one SUPER_ADMIN account (credentials from env vars, never hardcoded)
 *  - a couple of default categories so the CMS isn't empty on first run
 *
 * Run with: npx prisma db seed
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in the environment before seeding."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "VoxLibro Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  const categories = [
    { name: "Text-to-Speech", slug: "text-to-speech" },
    { name: "Android", slug: "android" },
    { name: "Accessibility", slug: "accessibility" },
    { name: "Productivity", slug: "productivity" },
    { name: "App Updates", slug: "app-updates" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`Seeded super admin: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
