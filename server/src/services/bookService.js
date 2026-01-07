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

    return {
      books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Update book copy
  async updateBookCopy(copyId, data) {
    const { condition, status, location } = data;

    const copy = await prisma.bookCopy.findUnique({
      where: { id: copyId },
      include: {
        loans: {
          where: { status: { in: ["active", "overdue"] } },
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
        location: location !== undefined ? location : copy.location,
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
          where: { status: { in: ["active", "overdue"] } },
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
                include: {
                    user: {
                        select: {
                            email: true,
                            profile: {
                                select: { fullName: true }
                            }
                        }
                    }
                }
            }
        }
    });
    
    return copies;
  },

  // Get available copies for borrowing (public)
  async getAvailableCopies(bookId) {
    const copies = await prisma.bookCopy.findMany({
      where: {
        bookId,
        status: "available",
      },
      select: {
        id: true,
        copyCode: true,
        condition: true,
        status: true,
        location: true,
      },
    });

    return copies;
  },

  // Search books
  async searchBooks(query) {
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { authors: { contains: query, mode: "insensitive" } },
          { isbn13: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        _count: {
          select: {
            copies: true,
          },
        },
        copies: {
          where: { status: "available" },
          select: { id: true },
        },
      },
      take: 20,
    });

    return books;
  },

  // Get book by ID
  async getBookById(bookId) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        _count: {
          select: {
            copies: true,
          },
        },
        copies: {
          where: { status: "available" },
          select: { id: true, condition: true },
        },
      },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    return book;
  },

  // Create book (admin)
  async createBook(data) {
    const { title, authors, publisher, publishedYear, category, isbn13, description, coverImageUrl } = data;

    if (isbn13) {
      const existingBook = await prisma.book.findUnique({
        where: { isbn13 },
      });

      if (existingBook) {
        throw new Error("Book with this ISBN already exists");
      }
    }

    const book = await prisma.book.create({
      data: {
        title,
        authors,
        publisher,
        publishedYear: publishedYear ? parseInt(publishedYear) : null,
        category,
        isbn13,
        description,
        coverImageUrl,
      },
      include: {
        _count: {
          select: { copies: true },
        },
      },
    });

    return book;
  },

  // Update book (admin)
  async updateBook(bookId, data) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    if (data.isbn13 && data.isbn13 !== book.isbn13) {
      const existingBook = await prisma.book.findUnique({
        where: { isbn13: data.isbn13 },
      });

      if (existingBook) {
        throw new Error("ISBN already used by another book");
      }
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: data.title || book.title,
        authors: data.authors || book.authors,
        publisher: data.publisher !== undefined ? data.publisher : book.publisher,
        publishedYear: data.publishedYear !== undefined ? parseInt(data.publishedYear) : book.publishedYear,
        category: data.category || book.category,
        isbn13: data.isbn13 || book.isbn13,
        description: data.description !== undefined ? data.description : book.description,
        coverImageUrl: data.coverImageUrl !== undefined ? data.coverImageUrl : book.coverImageUrl,
      },
      include: {
        _count: {
          select: { copies: true },
        },
      },
    });

    return updatedBook;
  },

  // Delete book (admin)
  async deleteBook(bookId) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        copies: {
          include: {
            loans: {
              where: { status: { in: ["active", "overdue"] } },
            },
          },
        },
      },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    const hasActiveLoans = book.copies.some(
      (copy) => copy.loans && copy.loans.length > 0
    );

    if (hasActiveLoans) {
      throw new Error("Cannot delete book with active loans");
    }

    await prisma.book.delete({
      where: { id: bookId },
    });

    return { message: "Book deleted successfully" };
  },

  // Add book copy (admin)
  async addBookCopy(bookId, data) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    const { copyCode, condition = "good", status = "available" } = data;

    const existingCopy = await prisma.bookCopy.findUnique({
      where: { copyCode },
    });

    if (existingCopy) {
      throw new Error("Copy code already exists");
    }

    const copy = await prisma.bookCopy.create({
      data: {
        bookId,
        copyCode,
        condition,
        status,
      },
    });

    return copy;
  },

  // Get book copies (admin)
  async getBookCopies(bookId) {
    const copies = await prisma.bookCopy.findMany({
      where: { bookId },
      include: {
        loans: {
          where: { status: { in: ["active", "overdue"] } },
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: { fullName: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return copies;
  },

};
