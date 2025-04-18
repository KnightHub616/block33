// Import pg
const pg = require("pg");

// Import and configure dotenv to load variables from .env file
require("dotenv").config();

// process.env.DATABASE_URL reads the value from your .env file
const client = new pg.Client(process.env.DATABASE_URL);

// Export the client
module.exports = client;
