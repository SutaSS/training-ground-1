import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const pool = new pg.Pool({
    connectionString: process.env.DIRECT_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({adapter});

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@library.com",
      passwordHash: hashedPassword,
      role: "admin",
      status: "active",
      profile: {
        create: {
          fullName: "Admin Library",
          phone: "081234567890",
          address: "Library HQ",
        },
      },
    },
  });

  // Create books
  const book1 = await prisma.book.create({
    data: {
      title: "The Pragmatic Programmer",
      authors: "Andrew Hunt, David Thomas",
      publisher: "Addison-Wesley",
      publishedYear: 1999,
      category: "Programming",
      isbn13: "9780135957059",
      description: "Your journey to mastery",
    },
  });

  const book2 = await prisma.book.create({
    data: {
      title: "Clean Code",
      authors: "Robert C. Martin",
      publisher: "Prentice Hall",
      publishedYear: 2008,
      category: "Programming",
      isbn13: "9780132350884",
      description: "A Handbook of Agile Software Craftsmanship",
    },
  });

  // Create book copies
  await prisma.bookCopy.createMany({
    data: [
      {
        bookId: book1.id,
        copyCode: "PRAG-001",
        condition: "good",
        status: "available",
      },
      {
        bookId: book1.id,
        copyCode: "PRAG-002",
        condition: "good",
        status: "available",
      },
      {
        bookId: book2.id,
        copyCode: "CLEAN-001",
        condition: "good",
        status: "available",
      },
    ],
  });

  console.log("Seeding completed.");
  console.log({ admin, book1, book2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
