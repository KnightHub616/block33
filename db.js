const pg = require(`pg`);
// configure database connection
const client = new pg.Client(
  `postgres://joshc:Vegas0623@localhost:5432/acme_hr_db`
);

// Export the client 
module.exports = client;
