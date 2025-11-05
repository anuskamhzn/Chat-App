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
export const register = async (req, res) => {
    try {
        const { email, password, confirmPassword, name } = req.body;

        // Input validation checks
        if (!email || !password  || !confirmPassword || !name) {
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
export const login = async (req, res)=> {
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