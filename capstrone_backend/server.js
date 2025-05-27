const express = require('express');
const db = require('./db');

const app = express();
const port = 8000;

app.use(express.json());

app.post('/api/validate-sim', async (req, res) => {
  const { service_number, sim_number, sim_status } = req.body;

  if (!service_number || !sim_number || !sim_status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const insertQuery = `
      INSERT INTO simDetails (service_number, sim_number, sim_status)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const result = await db.query(insertQuery, [
      service_number,
      sim_number,
      sim_status,
    ]);

    res.status(201).json({
      message: 'Sim detail inserted successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Insert Error:', error.message);
    res.status(500).json({
      error: 'Failed to insert sim detail.',
      details: error.message,
    });
  }
});

function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

function isValidEmail(email) {
  const atSplit = email.split('@');
  if (atSplit.length !== 2) return false;

  const domainPart = atSplit[1];
  const dotSplit = domainPart.split('.');
  if (dotSplit.length !== 2) return false;

  const extension = dotSplit[1];
  if (extension.length !== 2 && extension.length !== 3) return false;

  return true;
}

app.post('/api/validate-customer', async (req, res) => {
  const { email_address, date_of_birth } = req.body;

  if (!email_address || !date_of_birth) {
    return res.status(400).json({ error: 'Email adress and Date of birth  value is required' });
  }

  if (!isValidDate(date_of_birth)) {
    return res.status(400).json({ error: 'Invalid date of birth format. Expected yyyy-mm-dd' });
  }

  if (!isValidEmail(email_address)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const query = `SELECT * FROM CustomerIdentity WHERE email_address = $1 AND date_of_birth = $2`;
    const result = await db.query(query, [email_address, date_of_birth]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid customer,this customer does not exist ' });
    }

    // Success
    return res.status(200).json({
      message: 'Customer validated successfully',
      customer: result.rows[0],
    });
  } catch (error) {
    console.error('Error validating customer:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/validate-otp', async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: 'OTP is required' });
  }

  try {
    const query = `SELECT * FROM OtpDetails WHERE otp = $1`;
    const result = await db.query(query, [otp]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid OTP' });
    }

    // Success
    return res.status(200).json({
      message: 'OTP validated successfully',
      otpDetails: result.rows[0],
    });
  } catch (error) {
    console.error('Error validating OTP:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sim-details', async (req, res) => {
  try {
    const query = `SELECT * FROM simDetails`;
    const result = await db.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No SIM details found' });
    }

    // Success
    return res.status(200).json({
      message: 'SIM details retrieved successfully',
      simDetails: result.rows,
    });
  } catch (error) {
    console.error('Error retrieving SIM details:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
