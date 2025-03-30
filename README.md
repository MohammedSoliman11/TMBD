# TMDB Express API

A RESTful API built with Express.js that integrates with The Movie Database (TMDB) API. This project allows users to browse movies, rate them, and manage their watchlist.

## Features

- Movie browsing and searching
- User authentication
- Movie rating system
- Watchlist management
- Redis caching for improved performance
- MongoDB for data persistence
- Docker support for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- Docker and Docker Compose (optional, for containerized deployment)
- TMDB API Key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/tmdb-app
TMDB_API_URL=https://api.themoviedb.org/3
TMDB_API_KEY=your_tmdb_api_key
JWT_SECRET=your_jwt_secret
REDIS_PORT=6379
NODE_ENV=development
```

## Installation

### Without Docker

1. Clone the repository:

```bash
git clone <repository-url>
cd tmdb-project
```

2. Install dependencies:

```bash
npm install
```

3. Start MongoDB and Redis locally

4. Start the application:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### With Docker

1. Clone the repository:

```bash
git clone <repository-url>
cd tmdb-project
```

2. Build and start the containers:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:8080`

## API Endpoints

### Movies

- `GET /api/movies`

  - Get all movies
  - Query Parameters:
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
    - `search`: Search term for movie title

- `POST /api/movies/:id/rate`

  - Rate a movie
  - Requires authentication
  - Request body:
    ```json
    {
      "rating": 5
    }
    ```

- `POST /api/movies/:id/watchlist`
  - Add a movie to watchlist
  - Requires authentication

### Users

- `POST /api/users/signup`
  - Register a new user
  - Request body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```

## Testing

Run the test suite:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## API Documentation

Once the server is running, you can access the Swagger UI documentation at:

```
http://localhost:8080/api-docs
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. By default, it allows 100 requests per 15 minutes per IP address.

## Security

- Helmet.js for security headers
- CORS enabled
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
