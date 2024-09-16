import 'dotenv/config';

import admin from 'firebase-admin';
import express from 'express';
import morgan from 'morgan';
import { initializeApp } from 'firebase-admin/app';

import deleteFile from './router/delete.js';
import getFile from './router/get.js';
import upload from './router/upload.js';

// initialize firebase app
initializeApp({
	credential: admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
	}),
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const app = express();

app.set('json spaces', 2);
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(morgan('dev'));

app.get('/', (req, res) => {
	res.sendFile(process.cwd() + '/public/index.html');
});

app.use('/upload', upload);
app.use(getFile);
app.use(deleteFile);

app.use((req, res) => {
	res.status(404).sendFile(process.cwd() + '/public/404.html');
});

app.listen(process.env.PORT || 3000, () => {
	console.log('Server listening on port 3000');
});
