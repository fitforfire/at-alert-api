import express  from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { getData, getNewAlerts, prepareResult } from './index';
import cron from 'node-cron';

require('dotenv').config();

// Schedule a task to run every 5 minutes
cron.schedule(process.env.CRONJOB_SCHEDULE, async () => {
    getNewAlerts();
});

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/api/getData', async (req, res) => {
    try {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]

        const from = req.query.from as string || todayString;
        const to = req.query.to as string || todayString;
        const type = req.query.type as string || '';
        const center = req.query.center as string;
        const radius = req.query.radius;
        const expired = req.query.expired !== undefined ? req.query.expired as string === "true" : true;

        const alerts = await getData({
            from,
            to,
            showExpired: expired
        });

        const result = await prepareResult({
            alerts: alerts,
            center,
            radius
        }, type);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching current data', error: error.message });
    }
});

app.get('/api/getActive', async (req, res) => {
    try {
        const fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 1);
        const fromString = fromDate.toISOString().split('T')[0];

        const toDate = new Date();
        const toDateString = toDate.toISOString().split('T')[0]

        const from = fromString;
        const to = toDateString;
        const type = req.query.type as string || '';
        const center = req.query.center as string;
        const radius = req.query.radius;

        const alerts = await getData({
            from,
            to,
            showExpired: false
        });

        const result = await prepareResult({
            alerts: alerts,
            center,
            radius
        }, type);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching current data', error: error.message });
    }
});


app.use(bodyParser.json());
// We will store our client files in ./client directory.
// app.use(express.static(path.join(__dirname, "client")));