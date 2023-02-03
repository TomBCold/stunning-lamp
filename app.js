require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { run } = require('./runner')

const terminalRouter = require('./routes/terminalRouter');

const PORT = process.env.PORT ?? 3001;
const app = express();
const corsOptions = {
	origin: process.env.CLIENT_URL,
	methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
	credentials: true,
	optionSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', terminalRouter);

app.listen(PORT, () => {
	run();
	console.log(`Server has been started on PORT ${PORT}`);
});
