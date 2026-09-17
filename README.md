# Job Application Tracker API

A REST API for tracking companies and job applications. This project was created with Node.js, Express, and MongoDB and includes complete CRUD operations, data validation, error handling, and interactive Swagger documentation.

## Features

- Manage companies and job applications.
- GET, POST, PUT, and DELETE operations for two MongoDB collections.
- Validation for POST and PUT requests.
- MongoDB ObjectId validation.
- Proper HTTP status codes.
- Error handling with `try/catch`.
- Interactive Swagger documentation.
- Secure environment-variable configuration.

## Technologies

- Node.js
- Express
- MongoDB Atlas
- MongoDB Node.js Driver
- Swagger UI
- dotenv
- CORS
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
| 404 | Document not found |
| 500 | Internal server error |

## Security

The `.env` file and MongoDB credentials are excluded from GitHub through `.gitignore`. Never commit database usernames, passwords, or connection strings.

## Future Development

OAuth authentication and user management will be added during the next phase of the project.

## Author

David Canales