const express = require('express');
const cors = require('cors');
const User = require('./model/schema');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const PORT = process.env.PORT;
const JWT_SECRET = process.env.SECRET;

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
}).then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log(err);
});

const app = express();

// Apply rate limiter before other middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});
app.use('/user', limiter);

// Order of middleware is important
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(cors({
    origin: 'http://localhost:4200', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add this after your CORS middleware
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    next();
});


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Register endpoint
app.post('/user/register', async (req, res) => {
    const { username, email, password, repassword } = req.body;
    
    try {
        // Check if passwords match
        if (password !== repassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.username === username ? 
                    "Username already exists" : "Email already exists" 
            });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
        });
        
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: "User created successfully",
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

// Login endpoint
app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error during login", error: error.message });
    }
});

app.post('/user/forgot-password', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    try{
        if(newPassword !== confirmPassword){
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.json({ message: "Password updated successfully" });
    }catch(error){
        res.status(500).json({ message: "Error updating password", error: error.message });
    }
});

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
    res.json({ 
        message: "This is a protected route", 
        user: req.user 
    });
});

// Protected route for user profile
app.get('/user/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
});

// Protected route for updating user profile
app.put('/user/profile', verifyToken, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: req.body },
            { new: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// Protected route for deleting account
app.delete('/user/account', verifyToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.userId);
        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting account", error: error.message });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});