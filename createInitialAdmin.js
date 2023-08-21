import 'dotenv/config.js';
import User from './models/userModel.js';
import connectWithMongoDB from './configs/mongodbConnection.js';

await connectWithMongoDB();

const createInitialAdmin = async (req, res, next) => {
  try {
    const adminName = 'admin';
    const adminPassword = 'adminpassword';
    const adminEmail = 'admin@gmail.com';

    // check if user exists in database
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin)
      console.log(`admin with the email ${adminEmail} already exists`);

    // create initial admin user
    await User.create({
      name: adminName,
      password: adminPassword,
      email: adminEmail,
      roles: ['admin'],
      profileImage: 'admin-profile.jpg',
    });

    console.log('initial admin user created successfully');
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

await createInitialAdmin();
