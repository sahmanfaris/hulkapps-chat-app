const { connect } = require("mongoose");

const connectToMongoDB = async () => {
  try {
    const res = await connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${res.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

export default connectToMongoDB;
