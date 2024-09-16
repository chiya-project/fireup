import admin from 'firebase-admin';
import axios from 'axios';
import NodeCache from 'node-cache';

import { Router } from 'express';

const router = Router();
const cache = new NodeCache({ stdTTL: 0 });

router.get('/:fileId', async (req, res, next) => {
	try {
		const fileId = req.params.fileId;
		const BASE_URL = `${req.protocol}://${req.hostname === 'localhost' ? 'localhost:' + (process.env.PORT || 3000) : req.hostname}`;

		if (fileId.includes('.')) return next();

		let fileData;
		let url;
		if (cache.has(fileId) && cache.get(fileId).originalUrl) {
			let cachedData = cache.get(fileId);
			fileData = cachedData.fileData;
			url = cachedData.originalUrl;
		} else {
			const filesRef = admin.database().ref('/files/' + fileId);
			const fileSnapshot = await filesRef.once('value');

			if (!fileSnapshot.exists()) {
				return res.status(404).sendFile(process.cwd() + '/public/404.html');
			}

			fileData = await fileSnapshot.val();

			const bucket = admin.storage().bucket();
			const fileRef = bucket.file(fileData.name);

			[url] = await fileRef.getSignedUrl({
				action: 'read',
				expires: Date.now() + 20 * 60 * 1000,
			});

			cache.set(fileId, { fileData, originalUrl: url }, 20 * 60);
		}

		if (req.query.hasOwnProperty('json')) {
			if (fileData.userAddress) delete fileData.userAddress;
			return res.status(200).json({ ...fileData, url: `${BASE_URL}/${fileId}` });
		}

		const response = await axios.get(url, {
			responseType: 'arraybuffer',
		});

		res.setHeader('Content-Type', fileData.mimetype);
		res.setHeader('Content-Disposition', `inline; filename=${fileData?.originalName || fileData.name}`);

		return res.status(200).send(response.data);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;
