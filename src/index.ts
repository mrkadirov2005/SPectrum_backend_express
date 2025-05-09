import express, { Application, Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// import cors from 'cors';
import connectDB from './config/db';

// Import route files
import clientRoutes from './routes/Client.route'; 
import adminRoute from './routes/Admin.route';
import staffRoute from './routes/Staff.route';
import studentRoute from './routes/Student.route';
import testRoute from './routes/Test.route';
import commentRoute from './routes/Comment.route';
import loginRoute from './routes/Login.route'
import taskRoute from './routes/Task.router';
import loginRoutes from './routes/Logs.route';
import CalendarRouter from './routes/Calendar.route'
import SalaryRouter from './routes/Salary.route'

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();

// Middleware
// app.use(cors());
app.use(express.json());
app.use(cors());
// Connect to MongoDB
connectDB();

// Route handlers
// Explicitly tell TypeScript that `clientRoutes` is an express.Router
app.use('/client', clientRoutes);  //done
app.use('/admin', adminRoute );//done
app.use('/staff',staffRoute);//done
app.use('/student',studentRoute);//done
app.use('/test',testRoute);//done
app.use('/task',taskRoute);
app.use('/comment',commentRoute);//done
app.use('/login',loginRoute);//done
app.use('/logs',loginRoutes) //partially done
app.use('/calendar',CalendarRouter) //done
app.use('/salary',SalaryRouter)
 
// Default route
app.get('/', (_req: Request, res: Response) => {
  res.send('Spectrum Express API is running...');
});

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
