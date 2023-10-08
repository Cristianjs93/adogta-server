# Adogta Server

## Table of contents 📄

- [Adogta Server](#adogta-server)
  - [Table of contents 📄](#table-of-contents-)
  - [Overview :writing_hand:](#overview-writing_hand)
    - [Installation :gear:](#installation-gear)
  - [Express Router and Routes](#express-router-and-routes)
    - [Basic example **Create User** `/signup`:](#basic-example-create-user-signup)
    - [Built with 🛠️](#built-with-️)
  - [Author 👊](#author-)

## Overview :writing_hand:

REST API for Agosta App. The application connects to a user interface developed with Reactjs. This repository contains the backend structure. Here is the link to the frontend repository: [Frontend Repository](https://github.com/Cristianjs93/adogta-client), and the link to the deployed application on Vercel: [Deployed Project]()."

### Installation :gear:

To get started with the project, follow these steps:

1. Clone the repository:

```shell
git clone https://github.com/Cristianjs93/adogta-server
```

2. Navigate to the project directory:

```shell
cd adogta-server
```

3. Install the dependencies:

```shell
 npm install
```

4. Start the application:

```shell
 npm start
```

## Express Router and Routes

| Route                            | HTTP Verb | Description                    |
| -------------------------------- | --------- | ------------------------------ |
| /signup                          | POST      | Creates a user                 |
| /verified/:token                 | GET       | Verifiesuser email             |
| /login                           | POST      | User log in                    |
| /me                              | GET       | Load a loged user              |
| /:id/profile                     | PUT       | Updates user profile           |
| /:userId/requests                | GET       | List user request              |
| /foundations                     | GET       | List of foundations            |
| /foundations/:id                 | GET       | Get individual foundation      |
| /foundations/:id/requests        | GET       | List foundation request        |
| /foundations/:foundationId/pets  | GET       | List of pets                   |
| /foundations/:foundationId/pets  | POST      | Create a pet                   |
| /pets/:petId                     | GET       | Get individual pet             |
| /pets/:petId                     | DELETE    | Deletes a pet                  |
| /pets/:petId/requests            | GET       | Get individual pet request     |
| /pets/:petId/requests/           | PUT       | Reject individual pet request  |
| /pets/:petId/requests/:requestId | PUT       | Updates individual pet request |
| /pets/:petId/request             | POST      | Creates an adoption request    |
| /admin                           | GET       | List of foundations            |
| /admin                           | DELETE    | Deletes a foundation           |
| /admin/users                     | GET       | List of users                  |
| /admin/users                     | DELETE    | Deletes a user                 |
| /adminSearch                     | POST      | Searchs foundations            |
| /donate/payment                  | POST      | Create a donation              |

### Basic example **Create User** `/signup`:

Request Body:

```json
{
  "email": "jd@test.com",
  "name": "John Doe",
  "password": "Jdoe1234"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTIxZjUxM2Q3YzBiOWNjMDBmMTFjZmMiLCJpYXQiOjE2OTY3MjQyNDR9.QjuePuMwLjP3Zoj3nV5pFeSbcYYaDW6UrTN3zKcKHDw"
}
```

Email confirmed:

```json
{
  "_id": "6521f513d7c0b9cc00f11cfc",
  "email": "jd@test.com",
  "password": "$2b$10$ACk7iAJHQakeeqdLD4.9n./XKdBh2Eq6Oiw..blQKRg4LQtCoCI9e",
  "name": "John Doe",
  "role": "user",
  "active": true,
  "passwordResetToken": null,
  "createdAt": { "$date": { "$numberLong": "1696724243969" } },
  "updatedAt": { "$date": { "$numberLong": "1696724243969" } }
}
```

### Built with 🛠️

- Built with Node.js and Express
- Javascript
- MongoDB
- REST API

## Author 👊

This project was created by [Cristianjs93](https://github.com/Cristianjs93).
