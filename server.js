// Import necessary modules
const express = require("express");
const client = require("./db");

// Create an Express application instance
const app = express();

// Middleware to parse JSON request bodies (needed for POST/PUT)
app.use(express.json());

// Define the main initialization function
const init = async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to database!");

    // Define the port the server will listen on
    const PORT = process.env.PORT || 3000;

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to database or starting server:", error);
    process.exit(1);
  }
};

// GET /api/departments - Returns array of departments
app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM departments;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/employees - Returns array of employees
app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM employees ORDER BY created_at DESC;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/employees - Creates a new employee
app.post("/api/employees", async (req, res, next) => {
  // Extract name and department_id from the request body
  const { name, department_id } = req.body;

  if (!name || !department_id) {
    return res
      .status(400)
      .send({ error: "Missing required fields: name and department_id" });
  }

  try {
    const SQL = `
      INSERT INTO employees(name, department_id)
      VALUES($1, $2)
      RETURNING *;
    `;
    const response = await client.query(SQL, [name, department_id]);

    res.status(201).send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/employees/:id - Deletes an employee
app.delete("/api/employees/:id", async (req, res, next) => {
  // Extract the employee ID from the URL parameters
  const { id } = req.params;

  try {
    const SQL = `DELETE FROM employees WHERE id = $1;`;
    const response = await client.query(SQL, [id]);

    if (response.rowCount === 0) {
    }

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// PUT /api/employees/:id - Updates an employee
app.put("/api/employees/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name, department_id } = req.body;

  if (!name || !department_id) {
    return res
      .status(400)
      .send({ error: "Missing required fields: name and department_id" });
  }

  try {
    // SQL query to update an employee's details and updated_at timestamp
    const SQL = `
      UPDATE employees
      SET name = $1, department_id = $2, updated_at = now()
      WHERE id = $3
      RETURNING *;
    `;

    // Execute the query with parameterized values
    const response = await client.query(SQL, [name, department_id, id]);

    if (response.rowCount === 0) {
      return res.status(404).send({ error: "Employee not found" });
    }

    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
app.use((err, req, res, next) => {
  console.error(err.stack || err);

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).send({
    error: err.message || "An unexpected error occurred.",
  });
});

// Call the initialization function to start the server
init();
