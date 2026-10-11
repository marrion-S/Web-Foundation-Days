# Library REST API Design

This document describes a REST API for a library's **books** resource.

- **Base path:** `/api`
- **Resource:** `books`
- **Data format:** JSON (`Content-Type: application/json`)
- **Identifiers:** each book has a numeric `id`, for example `/api/books/42`

A book looks like this:

```json
{
  "id": 42,
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "year": 1958,
  "isbn": "9780385474542",
  "available": true
}
```

## Endpoints

### 1. List all books

- **Method:** `GET`
- **Path:** `/api/books`
- **Description:** Returns every book in the library.
- **Request body:** none
- **Success status code:** `200 OK`

### 2. Get one book

- **Method:** `GET`
- **Path:** `/api/books/{id}`
- **Description:** Returns the single book with the given id.
- **Request body:** none
- **Success status code:** `200 OK`

### 3. Create a book

- **Method:** `POST`
- **Path:** `/api/books`
- **Description:** Adds a new book to the library; the server assigns the `id`.
- **Example request body:**

  ```json
  {
    "title": "Weep Not, Child",
    "author": "Ngugi wa Thiong'o",
    "year": 1964,
    "isbn": "9780435908300"
  }
  ```

- **Success status code:** `201 Created`

### 4. Update a book (replace)

- **Method:** `PUT`
- **Path:** `/api/books/{id}`
- **Description:** Replaces all the details of an existing book.
- **Example request body:**

  ```json
  {
    "title": "Weep Not, Child",
    "author": "Ngugi wa Thiong'o",
    "year": 1964,
    "isbn": "9780435908300",
    "available": false
  }
  ```

- **Success status code:** `200 OK`

### 5. Update a book (partial)

- **Method:** `PATCH`
- **Path:** `/api/books/{id}`
- **Description:** Changes only the fields that are sent, such as marking a book as borrowed.
- **Example request body:**

  ```json
  {
    "available": false
  }
  ```

- **Success status code:** `200 OK`

### 6. Delete a book

- **Method:** `DELETE`
- **Path:** `/api/books/{id}`
- **Description:** Removes the book from the library.
- **Request body:** none
- **Success status code:** `204 No Content` (nothing is returned)

### 7. List books by an author

- **Method:** `GET`
- **Path:** `/api/books?author={name}`
- **Example:** `/api/books?author=Chinua%20Achebe`
- **Description:** Returns only the books written by the given author, using a query parameter.
- **Request body:** none
- **Success status code:** `200 OK` (if the author has no books, the response is still `200` with an empty list `[]`)

## Error codes

### 400 Bad Request

The request is invalid, so the server cannot process it.

- **Example 1:** `POST /api/books` is sent without a `title`, or with `"year": "nineteen"` instead of a number.
- **Example 2:** `GET /api/books/abc` uses an id that is not a number.
- **Example response:**

  ```json
  {
    "error": "Bad Request",
    "message": "The field 'title' is required."
  }
  ```

### 404 Not Found

The requested resource does not exist.

- **Example 1:** `GET /api/books/9999` when no book has the id 9999.
- **Example 2:** `DELETE /api/books/9999` for a book that was already deleted.
- **Example response:**

  ```json
  {
    "error": "Not Found",
    "message": "No book found with id 9999."
  }
  ```
