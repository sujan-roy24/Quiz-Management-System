const dotenv = require('dotenv');
const app = require('./src/app'); // ✅ use central app
const connectDB = require('./src/config/db'); // ✅ reusable DB config

dotenv.config();

// Connect Database
connectDB();

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});