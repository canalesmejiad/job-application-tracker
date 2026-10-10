# Job Application Tracker API

A REST API for tracking companies, job applications, professional contacts, and interviews. Built with Node.js, Express, MongoDB, and GitHub OAuth.

## Features

- GET, POST, PUT, and DELETE operations for four collections.
- Data validation for POST and PUT requests.
- MongoDB ObjectId validation.
- Validation of relationships between collections.
- GitHub OAuth login and logout.
- Persistent sessions stored in MongoDB.
- Authentication required for contact and interview write operations.
- Error handling, including malformed JSON requests.
- Interactive Swagger documentation.
- Eight unit tests covering GET controllers across all four collections.

## Technologies

- Node.js
- Express
- MongoDB Atlas
- MongoDB Node.js Driver
- Passport and passport-github2
- express-session
- connect-mongo
- Swagger UI
- dotenv
- CORS
- nodemon
- Node.js test runner and assert

## Collections

### Companies

Fields:

`name`, `website`, `industry`, `location`, `contactName`,
`contactEmail`, `notes`, `createdAt`, and `updatedAt`.

### Applications

Fields:

`position`, `companyId`, `appliedDate`, `status`, `workMode`,
`location`, `salaryRange`, `jobUrl`, `description`, `technologies`,
`notes`, `createdAt`, and `updatedAt`.

`companyId` references an existing company.

### Contacts

Fields:

`name`, `email`, `phone`, `role`, `companyId`, `notes`,
`createdAt`, and `updatedAt`.

`companyId` references an existing company.

### Interviews

Fields:

`applicationId`, `scheduledAt`, `type`, `interviewer`, `location`,
`status`, `notes`, `createdAt`, and `updatedAt`.

`applicationId` references an existing job application.

MongoDB also assigns an `_id` to each document. A separate
`sessions` collection stores login sessions.

## Installation

1. Clone the repository and enter the project folder.
2. Use Node.js 24, the version used for local testing.
3. Install dependencies:

```bash
npm install
```

4. Copy the environment template:

```bash
cp .env.example .env
```

5. Fill in your configuration:

```env
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=job_application_tracker
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
SESSION_SECRET=your_long_random_session_secret
```

6. Register a GitHub OAuth App with:

- Homepage URL: `http://localhost:3000`
- Redirect URI: `http://localhost:3000/auth/github/callback`

7. Generate a session secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `SESSION_SECRET` in `.env`.

8. Start the development server:

```bash
npm run dev
```

The local API runs at `http://localhost:3000` unless `PORT`
is configured with a different value.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the development server with nodemon |
| `npm start` | Run the server with Node.js |
| `npm test` | Run all unit tests |

## Unit Tests

Run:

```bash
npm test
```

The eight tests cover two GET controller behaviors for each collection:

- List requests return status 200 and the expected data.
- Requests for a nonexistent document return status 404.

Tests use simulated MongoDB responses and Express response objects.
They do not require a running server, database connection, or OAuth credentials.

## API Documentation

Local Swagger documentation:

http://localhost:3000/api-docs

Swagger documents all four collections and the authentication routes.
Protected operations are marked as requiring a session cookie.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/auth/github` | Start GitHub login |
| GET | `/auth/github/callback` | Receive GitHub's authentication response |
| GET | `/auth/status` | Check the current login session |
| GET | `/auth/failure` | Report failed authentication |
| POST | `/auth/logout` | Log out and destroy the session |

Open `/auth/github` in a browser to complete login.
After successful login, the browser returns to `/api-docs`.

Swagger requests on the same origin use the browser's session cookie.
A terminal request with curl does not automatically share that cookie.

### Collection Routes

| Collection | List / Create | Get / Update / Delete |
| --- | --- | --- |
| Companies | `/companies` | `/companies/:id` |
| Applications | `/applications` | `/applications/:id` |
| Contacts | `/contacts` | `/contacts/:id` |
| Interviews | `/interviews` | `/interviews/:id` |

For each collection:

- GET on the collection path lists documents.
- POST on the collection path creates a document.
- GET on the ID path retrieves one document.
- PUT on the ID path updates a document.
- DELETE on the ID path deletes a document.

All collection GET routes are public.

POST, PUT, and DELETE for contacts and interviews require
an authenticated GitHub session. Requests without a session return 401.

Company and application write routes currently remain public.

## Validation

POST and PUT require all mandatory fields for the corresponding collection.

### Companies

- Required text fields.
- Valid contact email.
- Valid HTTP or HTTPS website URL.

### Applications

- Required text fields.
- Valid company ID referencing an existing company.
- Parseable application date.
- Allowed status and work mode.
- Valid HTTP or HTTPS job URL.
- Non-empty array of technology names.

Application statuses:

`saved`, `applied`, `interviewing`, `offer`, `rejected`, `withdrawn`.

Work modes:

`remote`, `hybrid`, `onsite`.

### Contacts

- Required name, email, phone, role, and company ID.
- Valid email.
- Valid company ID referencing an existing company.
- Optional notes must be a string.

### Interviews

- Required application ID, scheduled date, type, interviewer,
  location, and status.
- Valid application ID referencing an existing application.
- ISO date-time with seconds and timezone, such as
  `2026-10-20T15:00:00Z`.
- Allowed interview type and status.
- Optional notes must be a string.

Interview types:

`phone`, `video`, `onsite`.

Interview statuses:

`scheduled`, `completed`, `cancelled`.

## HTTP Status Codes

| Status | Meaning |
| --- | --- |
| 200 | Successful request |
| 201 | Document created |
| 204 | Document deleted; no response body |
| 400 | Invalid ID, request data, or malformed JSON |
| 401 | Authentication required or authentication failed |
| 404 | Document not found |
| 500 | Internal server error |

## Render Deployment

Existing deployment URLs:

- API: https://job-application-tracker-de2t.onrender.com
- Swagger: https://job-application-tracker-de2t.onrender.com/api-docs

The latest local changes still need to be deployed and verified on Render.

Configure these environment variables in Render:

- `MONGODB_URI`
- `DATABASE_NAME`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `SESSION_SECRET`
- `NODE_ENV=production`

For production, use a GitHub OAuth App configured for the Render domain.
Its Redirect URI must match:

https://job-application-tracker-de2t.onrender.com/auth/github/callback

Use that same URL for `GITHUB_CALLBACK_URL` in Render.

## Security

Keep real credentials in `.env` locally and in Render's environment settings.
The `.env` file is excluded from Git through `.gitignore`.

Commit `.env.example` with placeholder values only.

Session cookies are HTTP-only, use SameSite=Lax, and are marked Secure
when `NODE_ENV=production` or `RENDER=true`.

## Author

David Canales