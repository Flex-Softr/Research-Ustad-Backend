import cors from 'cors'; // ✅ ADD THIS
import cookieParser from 'cookie-parser';
import cron from "node-cron";
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import * as http from "http";
import { io } from './app/utils/socket';
import { courseModel } from './app/modules/Course/Course.model';
import { eventModel } from './app/modules/Event/event.model';
import { updateStatus } from './app/utils/RealtimeUpdate';
import path from 'path';
import config from './app/config/index';


const app: Application = express();
const server = http.createServer(app);

console.log("envvvv",config.frontend_url)

io.attach(server, {
  cors: {
    origin: config.frontend_url,  
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// ✅ Add this before any routes
app.use(cors({
  origin: config.frontend_url,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// application routes
app.use('/api/v1', router);


// ✅ Make uploaded files publicly accessible
app.use("/upload", express.static(path.join(process.cwd(), "upload")));



app.get('/', (req: Request, res: Response) => {
  res.send('Hi Researchustad website !');
});

app.use(globalErrorHandler);
app.use(notFound);

// Cron job
cron.schedule("*/1 * * * *", () => {
  updateStatus(courseModel, "status", "startDate"); 
  updateStatus(eventModel, "status", "startDate", "eventDuration"); 
});

export default app;
