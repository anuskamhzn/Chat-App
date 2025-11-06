import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming User model is exported as default or adjust import accordingly

// Function to compute initials from full name
const getInitials = (fullName) => {
    if (!fullName) return '';
    const nameParts = fullName.trim().split(/\s+/);
    const initials = nameParts
        .filter((part) => part.length > 0)
        .map((part) => part[0].toUpperCase())
        .join('');
    return initials.slice(0, 2);
};

// Modified register function to use OTP verification (though OTP logic is not implemented here; placeholder for future)
const register = async (req, res) => {
    try {
        const { email, password, confirmPassword, name } = req.body;

        // Input validation checks
        if (!email || !password || !confirmPassword || !name) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        if (password !== confirmPassword) {
            res.status(400).json({ message: "Passwords do not match" });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ message: "Password should be at least 6 characters long" });
            return;
        }

        // Check if this user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists, please login instead" });
            return;
        }

        // Regular new user registration flow
        const hashedPassword = await bcrypt.hash(password, 10);
        const initials = getInitials(name);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            initials,
            // Removed confirmPassword as it's redundant after validation; adjust model if needed
        });
        await user.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error in registration", error: (error).message });
    }
};

// Login with OTP verification check (OTP not implemented; placeholder)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Email not registered' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Incorrect password' });
            return;
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                initials: user.initials || getInitials(user.name),
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', error: (error).message });
    }
};

// User info route
const userInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            ...user.toObject(),
            initials: user.initials || getInitials(user.name),
            photo: user.photo && user.photo.data
                ? {
                    data: user.photo.data.toString('base64'),
                    contentType: user.photo.contentType,
                }
                : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error, unable to fetch user data',
            error: error.message || 'Internal Server Error',
        });
    }
};

// User info by ID
const userInfoById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            ...user.toObject(),
            initials: user.initials || getInitials(user.name),
            photo: user.photo && user.photo.data
                ? {
                    data: user.photo.data.toString('base64'),
                    contentType: user.photo.contentType,
                }
                : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

//update profile
const updateProfileController = async (req, res) => {
  try {
    // req.body comes from express.json()
    const { name, email } = req.body || {};

    // Ensure user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Build update object
    const updateData = {};

    if (name && name.trim() !== user.name) {
      updateData.name = name.trim();
      updateData.initials = getInitials(name.trim());
    }

    // Optional: allow email update (if your app supports it)
    if (email && email.trim() !== user.email) {
      updateData.email = email.trim();
    }

    // If nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No changes detected',
        user,
      });
    }

    // Update using Model (not instance)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateProfileController:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};
const deleteProfileController = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete user by ID
    await User.findByIdAndDelete(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteProfileController:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message,
    });
  }
};


export default {
    register,
    login,
    userInfo,
    userInfoById,
    updateProfileController,
    deleteProfileController
};