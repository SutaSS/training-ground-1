import { bookService } from '../services/bookService.js';

export const bookController = {
  // ==================== PUBLIC ====================
  
  // GET /api/books
  async getAllBooks(req, res, next) {
    try {
      const { category, search, availability, page, limit } = req.query;
      
      const filters = { category, search, availability };
      const pagination = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      };
      
      const result = await bookService.getAllBooks(filters, pagination);
      
      res.json({
        success: true,
        data: result.books,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // GET /api/books/search?q=query
  async searchBooks(req, res, next) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }
      
      const books = await bookService.searchBooks(q);
      
      res.json({
        success: true,
        data: books,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // GET /api/books/:id
  async getBookById(req, res, next) {
    try {
      const bookId = parseInt(req.params.id);
      
      const book = await bookService.getBookById(bookId);
      
      res.json({
        success: true,
        data: book,
      });
    } catch (error) {
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // GET /api/books/:id/available-copies
  async getAvailableCopies(req, res, next) {
    try {
      const bookId = parseInt(req.params.id);
      
      const copies = await bookService.getAvailableCopies(bookId);
      
      res.json({
        success: true,
        data: copies,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // ==================== ADMIN ONLY ====================
  
  // POST /api/books
  async createBook(req, res, next) {
    try {
      const { title, authors, publisher, publishedYear, category, isbn13, description, coverImageUrl } = req.body;
      
      if (!title || !authors) {
        return res.status(400).json({
          success: false,
          message: 'Title and authors are required',
        });
      }
      
      const book = await bookService.createBook({
        title,
        authors,
        publisher,
        publishedYear,
        category,
        isbn13,
        description,
        coverImageUrl,
      });
      
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: book,
      });
    } catch (error) {
      if (error.message === 'Book with this ISBN already exists') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // PUT /api/books/:id
  async updateBook(req, res, next) {
    try {
      const bookId = parseInt(req.params.id);
      const data = req.body;
      
      const book = await bookService.updateBook(bookId, data);
      
      res.json({
        success: true,
        message: 'Book updated successfully',
        data: book,
      });
    } catch (error) {
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'ISBN already used by another book') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // DELETE /api/books/:id
  async deleteBook(req, res, next) {
    try {
      const bookId = parseInt(req.params.id);
      
      const result = await bookService.deleteBook(bookId);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('active loans')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // ==================== BOOK COPY MANAGEMENT ====================
  
  // POST /api/books/:id/copies
  async addBookCopy(req, res, next) {
    try {
      const bookId = parseInt(req.params.id);
      const { copyCode, condition, status } = req.body;
      
      if (!copyCode) {
        return res.status(400).json({
          success: false,
          message: 'Copy code is required',
        });
      }
      
      const copy = await bookService.addBookCopy(bookId, {
        copyCode,
        condition,
        status,
      });
      
      res.status(201).json({
        success: true,
        message: 'Book copy added successfully',
        data: copy,
      });
    } catch (error) {
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Copy code already exists') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // GET /api/books/:id/copies
  async getBookCopies(req, res, next) {
    try {
      const bookId = parseInt(req.params.id);
      
      const copies = await bookService.getBookCopies(bookId);
      
      res.json({
        success: true,
        data: copies,
      });
    } catch (error) {
      next(error);
    }
  },
  
  // PUT /api/books/copies/:copyId
  async updateBookCopy(req, res, next) {
    try {
      const copyId = parseInt(req.params.copyId);
      const { condition, status, notes } = req.body;
      
      const copy = await bookService.updateBookCopy(copyId, {
        condition,
        status,
        notes,
      });
      
      res.json({
        success: true,
        message: 'Book copy updated successfully',
        data: copy,
      });
    } catch (error) {
      if (error.message === 'Book copy not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('active loan')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
  
  // DELETE /api/books/copies/:copyId
  async deleteBookCopy(req, res, next) {
    try {
      const copyId = parseInt(req.params.copyId);
      
      const result = await bookService.deleteBookCopy(copyId);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Book copy not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('active loan')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
};