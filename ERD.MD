// ...existing code...

## ERD (MVP)

User (admin|user)
 ├─ 1 ── 1 Profile
 ├─ 1 ── * Loan ── 1 ── BookCopy ── * ── 1 Book
 │             └─ 0..1 Fine ── * Payment
 ├─ 1 ── * Reservation ── * ── 1 Book
 └─ 1 ── * Notification

Book ── 1 ── * BookCopy

Notes:
- Satu judul (Book) bisa punya banyak eksemplar (BookCopy).
- Satu eksemplar (BookCopy) hanya bisa dipinjam aktif oleh satu Loan pada satu waktu.
- Fine dibuat dari Loan yang terlambat; bisa punya beberapa Payment.
- Reservation dibuat per Book (judul), bukan per eksemplar.

## Tabel (MVP)

- users
  - id (PK), email (unique), password_hash, role (enum: admin|user), status (active|blocked), created_at, updated_at

- profiles
  - id (PK), user_id (FK users), full_name, phone, address, avatar_url, created_at, updated_at

- books
  - id (PK), isbn13 (nullable|unique), title, subtitle, authors (text), publisher, published_year, description, cover_url, category, created_at, updated_at

- book_copies
  - id (PK), book_id (FK books), copy_code (unique), condition (good|damaged|lost), status (available|reserved|borrowed), location, created_at, updated_at

- loans
  - id (PK), user_id (FK users), copy_id (FK book_copies), status (active|returned|overdue|lost), loan_date, due_date, return_date (nullable), created_at, updated_at

- reservations
  - id (PK), user_id (FK users), book_id (FK books), status (active|fulfilled|cancelled|expired), queue_position, created_at, updated_at

- fines
  - id (PK), loan_id (FK loans), user_id (FK users), amount_total, amount_paid, status (unpaid|partial|paid), reason (late|lost|damage), created_at, updated_at

- payments
  - id (PK), fine_id (FK fines), user_id (FK users), amount, method (cash|transfer|other), paid_at, note

- notifications
  - id (PK), user_id (FK users), type (due_soon|overdue|reservation_ready|fine_added), title, message, read (bool), created_at

## Indeks & Constraint Penting
- users.email UNIQUE
- book_copies.copy_code UNIQUE
- loans: UNIQUE (copy_id, status='active') untuk cegah double-loan aktif
- reservations: INDEX (book_id, status, queue_position)
- fines: INDEX (user_id, status)
- books: INDEX (title, authors, category) untuk pencarian dasar

## Opsional (lanjutan)
- audit_logs: id, actor_user_id, action, entity_type, entity_id, metadata (JSON), created_at
- authors & book_authors, categories & book_categories (normalisasi penuh)
- policies: max_loans_per_user, loan_duration_days, fine_per_day

// ...existing code...