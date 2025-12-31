Table users {
  id int [pk, increment]
  email varchar [unique, not null]
  password_hash varchar [not null]
  role enum('admin', 'user') [not null]
  status enum('active', 'blocked') [not null]
  created_at timestamp
  updated_at timestamp
}

Table profiles {
  id int [pk, increment]
  user_id int [unique, not null]
  full_name varchar
  phone varchar
  address text
  avatar_url varchar
  created_at timestamp
  updated_at timestamp
}

Table books {
  id int [pk, increment]
  isbn13 varchar [unique]
  title varchar [not null]
  subtitle varchar
  authors text
  publisher varchar
  published_year int
  description text
  cover_url varchar
  category varchar
  created_at timestamp
  updated_at timestamp
}

Table book_copies {
  id int [pk, increment]
  book_id int [not null]
  copy_code varchar [unique, not null]
  condition enum('good', 'damaged', 'lost')
  status enum('available', 'reserved', 'borrowed')
  location varchar
  created_at timestamp
  updated_at timestamp
}

Table loans {
  id int [pk, increment]
  user_id int [not null]
  copy_id int [not null]
  status enum('active', 'returned', 'overdue', 'lost')
  loan_date date
  due_date date
  return_date date
  created_at timestamp
  updated_at timestamp

  indexes {
    (copy_id, status) [name: "unique_active_loan"]
  }
}

Table reservations {
  id int [pk, increment]
  user_id int [not null]
  book_id int [not null]
  status enum('active', 'fulfilled', 'cancelled', 'expired')
  queue_position int
  created_at timestamp
  updated_at timestamp

  indexes {
    (book_id, status, queue_position)
  }
}

Table fines {
  id int [pk, increment]
  loan_id int [not null]
  user_id int [not null]
  amount_total decimal
  amount_paid decimal
  status enum('unpaid', 'partial', 'paid')
  reason enum('late', 'lost', 'damage')
  created_at timestamp
  updated_at timestamp

  indexes {
    (user_id, status)
  }
}

Table payments {
  id int [pk, increment]
  fine_id int [not null]
  user_id int [not null]
  amount decimal
  method enum('cash', 'transfer', 'other')
  paid_at timestamp
  note text
}

Table notifications {
  id int [pk, increment]
  user_id int [not null]
  type enum('due_soon', 'overdue', 'reservation_ready', 'fine_added')
  title varchar
  message text
  read boolean
  created_at timestamp
}

/* ======================
   RELATIONSHIPS
====================== */

Ref: users.id < profiles.user_id

Ref: books.id < book_copies.book_id

Ref: users.id < loans.user_id
Ref: book_copies.id < loans.copy_id

Ref: users.id < reservations.user_id
Ref: books.id < reservations.book_id

Ref: loans.id < fines.loan_id
Ref: users.id < fines.user_id

Ref: fines.id < payments.fine_id
Ref: users.id < payments.user_id

Ref: users.id < notifications.user_id
