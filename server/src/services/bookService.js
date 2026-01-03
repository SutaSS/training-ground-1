import prisma from "../config/prisma.js";

export const bookService = {
  //=======Public User and Admin=======

  //Get All Books with Author and Category
  async getAllBooks(filters = {}, pagination) {
    const { category, search, availability } = filters;
    const { page = 1, limit = 10 } = pagination;

    const skip = (page - 1) * limit;

    const where = {};

    if (category) {
      where.category = { name: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { authors: { contains: search, mode: "insensitive" } },
        { isbn13: { contains: search, mode: "insensitive" } },
      ];
    }

    if (availability === "available") {
      where.copies = {
        some: {
          status: "available",
        },
      };
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              copies: true,
            },
          },
          copies: {
            where: {
              status: "available",
            },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.book.count({ where }),
    ]);
  },

  // Update book copy
  async updateBookCopy(copyId, data) {
    const { condition, status, notes } = data;

    const copy = await prisma.bookCopy.findUnique({
      where: { id: copyId },
      include: {
        loans: {
          where: { status: { in: ["borrowed", "overdue"] } },
        },
      },
    });

    if (!copy) {
      throw new Error("Book copy not found");
    }

    // Prevent changing status to 'available' if there are active loans
    if (status === "available" && copy.loans && copy.loans.length > 0) {
      throw new Error(
        "Cannot mark copy as available while it has active loans"
      );
    }

    const updatedCopy = await prisma.bookCopy.update({
      where: { id: copyId },
      data: {
        condition: condition || copy.condition,
        status: status || copy.status,
        notes: notes !== undefined ? notes : copy.notes,
      },
    });

    return updatedCopy;
  },

  // Delete book copy (if not active loans)
  async deleteBookCopy(copyId) {
    const copy = await prisma.bookCopy.findUnique({
      where: { id: copyId },
      include: {
        loans: {
          where: { status: { in: ["borrowed", "overdue"] } },
        },
      },
    });

    if (!copy) {
      throw new Error("Book copy not found");
    }

    if (copy.loans && copy.loans.length > 0) {
      throw new Error("Cannot delete book copy with active loans");
    }

    await prisma.bookCopy.delete({
      where: { id: copyId },
    });
    return { message: "Book copy deleted successfully" };
  },

  // get all book copies
  async getAllBookCopies(bookId) {
    const copies = await prisma.bookCopy.findMany({
        where: { bookId },
        include: {
            loans: {
                where: { status: { in: ["borrowed", "overdue"] } },
            },
            include: {
                user: {
                    select: {
                        email: true,
                        profile: {
                            select: { fullName: true}
                        }
                    }
                }

            }
        }
    });
    
    return copies;
  },

};
