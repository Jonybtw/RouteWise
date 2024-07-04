## Overview

**RouteWise** is a web application inspired by Google Maps with these features:
- User authentication and authorization system
- Creation and management of user profiles
- Route search and planning
- Saving routes
- Sending password reset emails

## Screenshots
### Login Page Preview
![image](https://github.com/Jonybtw/RouteWise/assets/84144569/cb75165f-9e5e-4bbd-b6df-ae6fbb3ec25e)
### Sign up Page Preview
![image](https://github.com/Jonybtw/RouteWise/assets/84144569/00c4cbea-8a31-4356-b610-3fc1309e7ad4)

### Main Page Preview
![image](https://github.com/Jonybtw/RouteWise/assets/84144569/2f328ba7-6291-474f-8cd3-53951fa8489a)

### User Profile
![image](https://github.com/Jonybtw/RouteWise/assets/84144569/43cecdec-eb77-4cac-ab88-9f3d4f95144a)

### Routes Page
![image](https://github.com/Jonybtw/RouteWise/assets/84144569/3b50c35c-ecf6-46e1-9625-2aab795b1bcd)
### Route Details + Saved Routes
![image](https://github.com/Jonybtw/RouteWise/assets/84144569/2f655c2f-cde5-4b13-82c6-0fa99d38594f)
![image](https://github.com/Jonybtw/RouteWise/assets/84144569/6efff2bc-1605-4534-8665-a5461ca99868)

### Programming Languages:
- Node.js
- HTML
- CSS
- JavaScript

### Node.js Libraries:
- BCrypt (Password hashing)
- CryptoJS (General cryptography)
- JWT (Authentication and authorization)
- Nodemailer (Email sending)

### Frameworks:
- Bootstrap

This guide will help you set up and start the project. Follow the steps below to configure and run both the server and client parts of the application.

## Requirements

Before starting, ensure you have the following:

- **Node.js**: Ensure Node.js is installed on your machine.
  - **Download**: [Node.js Official Website](https://nodejs.org/)

- **MongoDB Atlas Account**: You need a MongoDB Atlas account for database management.
  - **Sign Up**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Default Ports

- **Live Client Server Port**: 5550
- **Express Server Port**: 420

## Database Structure

**Database:** `data`

**Collections:**

- `data.users`
- `data.routes`

## Configuration

### Change the Google Maps API in `routes.html`

1. Open the `routes.html` file.
2. Locate the section where the Google Maps API key is included.
3. Replace the existing API key with your own Google Maps API key.

```javascript
key: "YOUR_KEY_HERE",
```

### Change the IP Geolocation API Key in `mapa.js`

1. Open the `mapa.js` file.
2. Find the `getLocationFromIP()` function.
3. Update the API key with your own IP Geolocation API key.

```javascript
function getLocationFromIP() {
    const response = await fetch(
      "https://api.ipgeolocation.io/ipgeo?apiKey=YOUR_KEY_HERE"
    );
}
```

### Nodemailer Setup

For email functionality, configure the `nodemailer` setup. Below is an example setup using an [Ethereal](https://ethereal.email/) email account. Replace the credentials with your actual email service credentials when deploying.

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'email@ethereal.email',
    pass: 'password'
  }
});
```

### Setup the `.env` File

1. Create a `.env` file in the root directory of your project.
2. Add the following environment variables to the `.env` file:

```env
ATLAS_URL=mongodb+srv://<your_database_url>
PORT=420
SECRET_TOKEN_KEY='<your_secret_token_key>'
SECRET_AES_KEY='<your_secret_aes_key>'
```
## Starting the Server

  1. Navigate to the server directory:
  ```bash
  cd new
  cd server
  ```
  2. Install the dependencies:
  ```bash
  npm install
  ```
  3. Clean install the project dependencies:
  ```bash
  npm ci
  ```
  4. Start the server using nodemon:
  ```bash
  npx nodemon
  ```
## Starting the Client

To start the client, use a live server. You can use extensions like Live Server in Visual Studio Code or any other live server tool of your choice.

  1. Ensure your live server is configured to run on port 5550.
  2. Start the live server and open your browser to http://127.0.0.1:5550.

---
