import admin from 'firebase-admin';
import { Router } from 'express';

import getClientIP from '../helper/getClientIP.js';

const router = Router();

router.delete('/:fileId', async (req, res) => {
	try {
		const fileId = req.params.fileId;
		const userAddress = getClientIP(req);

		const filesRef = admin.database().ref('/files/' + fileId);
		const filesSnapshot = await filesRef.once('value');

		if (!filesSnapshot.exists()) {
			return res.status(404).sendFile(process.cwd() + '/public/404.html');
		}

		const fileData = await filesSnapshot.val();

		if (fileData.userAddress && fileData.userAddress !== userAddress) {
			return res.status(403).sendFile(process.cwd() + '/public/403.html');
		}

		const bucket = admin.storage().bucket();
		const fileRef = bucket.file(fileData.name);

		filesSnapshot.ref.remove();
		fileRef.delete();

		return res.status(301).redirect('/');
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;
