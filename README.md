## Overview

**RouteWise** is a web application inspired by Google Maps

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

### Nodemailer Setup

For email functionality, configure `user.mjs`. Below is an example setup using [Ethereal](https://ethereal.email/). Replace the credentials with your actual email service credentials when deploying.

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
