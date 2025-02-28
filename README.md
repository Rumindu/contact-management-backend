# Contact Management Backend

A RESTful API backend for basic CRUD functionalities for contact management system, built with NestJS, TypeORM, and PostgreSQL.

## Features

- CRUD operations for contacts
- Input validation with DTOs
- PostgreSQL database integration
- Error handling and validation
- Search functionality

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Rumindu/contact-management-backend.git
cd contact-management-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file based on .env.sample:
```bash
cp .env.sample .env
```

4. Update the .env file with your database credentials and other configurations.

 
5. Create a new PostgreSQL database:
   - The database name should match the `DB_DATABASE` value in your `.env` file
   - For example, with the default settings, create a database named `contact_management`

   ```sql
   CREATE DATABASE contact_management;
   ```


6. Running the Application
```bash
npm run start:dev
```