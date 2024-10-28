# Trips API Service

A NestJS-based API service for managing trips, providing features for searching, saving, and managing trip information. This service integrates with the BizAway API.

## Features

- **Trip Search**
  - Get available trips with filtering by origin and destination
  - Sort results by fastest or cheapest options
  - Integration with BizAway API through HTTP Module
- **Trip Management**
  - Save trip details
  - Delete saved trips
  - Retrieve saved trips with search filters (origin/destination)
  - Sort saved trips by duration or price
- **Data Validation**
  - Class-validator implementation
  - Custom validators for IATA codes
- **Security**
  - Guard implementation for third-party API integration

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB
- **Language**: TypeScript
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger
- **Testing**: Jest
- **HTTP Client**: @nestjs/axios
- **Container**: Docker
- **ODM**: Mongoose

## Prerequisites

- Node.js (LTS version)
- Docker and Docker Compose
- Git

## Installation

1. Clone the repository:

```bash
git clone https://github.com/floflor/trips-service.git
cd trips-service
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Update the `.env` file with your values:

```
# BizAway API KEY
API_KEY=your_api_key

# BizAway API URL
API_URL=your_api_url

# Choose a username of your preference (avoid special characters)
MONGO_USERNAME=your_username

# Choose a username of your preference (avoid special characters)
MONGO_PASSWORD=your_password

# Modify with selected username and password
MONGODB_URI=mongodb://your-username:your-password@localhost:27017/trips?authSource=admin
```

4. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the MongoDB container:

```bash
docker compose up -d
```

2. Run the application:

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Development

```bash
# Format code
npm run format

# Lint code
npm run lint
```

## API Documentation

API documentation is available at `/docs` when the application is running. This provides a Swagger UI interface for exploring and testing the available endpoints.

## Compromises and Future Considerations
This API service currently employs a simplified approach to saving, listing and deleting trips, aiming for fast access and ease of use. Some enhancements could improve data management, security, and scalability for a more robust, production-ready application:

### Collection Design
**Current Approach:** The service uses a single trips collection for storing trips. Saved trips are stored without being tied to specific users.

**Future Enhancements:**

- To better support user-specific saved trips, the database design could be expanded to include a users collection.
- With this design, saved trips could be linked to individual users, enabling access only to the trips saved by a specific user.

### User Authentication
**Current Approach**: API security is managed via a general API key for accessing the BizAway API and other endpoints.

**Future Enhancements:**

- In a production setting, user authentication could be extended to allow individual accounts, enabling each user to save and manage trips securely.
- Using a users collection, authentication tokens (e.g., JWTs) would validate user identity and authorize access to personal saved trips.
