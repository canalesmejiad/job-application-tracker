# Job Application Tracker API

A REST API for tracking companies and job applications. This project was created with Node.js, Express, MongoDB, and GitHub OAuth and includes complete CRUD operations, data validation, authenticated write operations, error handling, and interactive Swagger documentation.

## Features

- Manage companies and job applications.
- GET, POST, PUT, and DELETE operations for two MongoDB collections.
- Validation for POST and PUT requests.
- MongoDB ObjectId validation.
- Proper HTTP status codes.
- Error handling with `try/catch`.
- Interactive Swagger documentation.
- GitHub OAuth login and logout with persistent MongoDB sessions.
- Authentication protection for POST, PUT, and DELETE operations.
- Secure environment-variable configuration.

## Technologies

- Node.js
- Express
- MongoDB Atlas
- MongoDB Node.js Driver
- Swagger UI
- dotenv
- CORS
- Passport
- GitHub OAuth
- Express Session
- Connect Mongo
- nodemon

## Collections

### Companies

A company document contains:

- `name`
- `website`
- `industry`
- `location`
- `contactName`
- `contactEmail`
- `notes`
- `createdAt`
- `updatedAt`

### Applications

A job application document contains:

- `position`
- `companyId`
- `appliedDate`
- `status`
- `workMode`
- `location`
- `salaryRange`
- `jobUrl`
- `description`
- `technologies`
- `notes`
- `createdAt`
- `updatedAt`

The `companyId` field connects an application to an existing company.

## Installation

1. Clone the repository.
2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=job_application_tracker
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
SESSION_SECRET=replace_with_a_long_random_value
```

4. Start the development server:

```bash
npm run dev
```

The local API will run at:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
```

Runs the application with nodemon for development.

```bash
npm start
```

Runs the application with Node.js for production.

## API Documentation

Interactive Swagger documentation is available at:

```text
http://localhost:3000/api-docs
```

After deployment, replace `localhost:3000` with the Render domain.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/auth/github` | Start GitHub OAuth login |
| GET | `/auth/github/callback` | Complete the OAuth flow |
| GET | `/auth/status` | Check the current session |
| GET | `/auth/logout` | Log out and return to Swagger |
| POST | `/auth/logout` | Log out and return JSON |

After logging in through `/auth/github`, the browser receives an HTTP-only session cookie. Swagger requests on the same deployment automatically include this cookie.

### Companies

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/companies` | Get all companies |
| GET | `/companies/:id` | Get one company |
| POST | `/companies` | Create a company |
| PUT | `/companies/:id` | Update a company |
| DELETE | `/companies/:id` | Delete a company |

### Applications

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/applications` | Get all job applications |
| GET | `/applications/:id` | Get one job application |
| POST | `/applications` | Create a job application |
| PUT | `/applications/:id` | Update a job application |
| DELETE | `/applications/:id` | Delete a job application |

GET operations are public. POST, PUT, and DELETE operations require an authenticated GitHub session and return HTTP `401` when the user is not logged in.

## Validation

Company POST and PUT requests validate:

- Required text fields.
- Valid email addresses.
- Valid HTTP or HTTPS website URLs.

Application POST and PUT requests validate:

- Required text fields.
- Valid MongoDB company IDs.
- An existing company relationship.
- Valid dates.
- Allowed application statuses.
- Allowed work modes.
- Valid HTTP or HTTPS job URLs.
- A non-empty technologies array.

Allowed application statuses:

- `saved`
- `applied`
- `interviewing`
- `offer`
- `rejected`
- `withdrawn`

Allowed work modes:

- `remote`
- `hybrid`
- `onsite`

## HTTP Status Codes

| Status | Meaning |
| --- | --- |
| 200 | Request completed successfully |
| 201 | Document created successfully |
| 204 | Document deleted successfully |
| 400 | Invalid ID or request data |
| 401 | Authentication required |
| 404 | Document not found |
| 500 | Internal server error |

## Live Deployment

- API: https://job-application-tracker-de2t.onrender.com
- Swagger documentation: https://job-application-tracker-de2t.onrender.com/api-docs

## Security

The `.env` file, MongoDB credentials, GitHub client secret, and session secret are excluded from GitHub through `.gitignore`. Never commit database usernames, passwords, OAuth secrets, or connection strings.

Authentication uses GitHub OAuth. Sessions are stored in MongoDB and use an HTTP-only cookie. Production cookies are marked `Secure` and use `SameSite=Lax`.

## Author

David Canales
