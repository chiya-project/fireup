import admin from 'firebase-admin';
import crypto from 'crypto';
import mimes from 'mime-types';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { Router } from 'express';

import getClientIP from '../helper/getClientIP.js';
import { parseFileSize } from '../helper/format.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
	limits: {
		fileSize: parseFileSize(process.env.MAX_UPLOAD_SIZE), // 10 MB
	},
	storage,
});

router.post('/', upload.single('file'), async (req, res) => {
	try {
		const file = req.file;
		const userAddress = getClientIP(req);

		if (!file) {
			return res.status(400).json({ error: 'Need a field named "file" with a file.' });
		}

		const fileBuffer = file?.buffer;
		if (!fileBuffer) {
			return res.status(400).json({ error: 'Need a field named "file" with a file.' });
		}

		if (!process.env.ALLOWED_MIMETYPES.split(',').some(mimetype => mimetype == file.mimetype)) {
			return res.status(400).json({ error: 'Invalid file type.' });
		}

		const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

		const filesRef = admin.database().ref('/files/' + hash);
		const filesSnapshot = await filesRef.once('value');

		if (!filesSnapshot.exists()) {
			const bucket = admin.storage().bucket();

			const fileType = await fileTypeFromBuffer(fileBuffer);
			const mimetype = file.mimetype || fileType?.mime || 'application/octet-stream';
			const extension = mimes.extension(mimetype) || 'bin';
			const fileUpload = bucket.file(hash + '.' + extension);

			await fileUpload.save(fileBuffer, { contentType: mimetype, resumable: false });

			const fileData = {
				userAddress,
				mimetype,
				hash,
				size: file.size,
				name: hash + '.' + extension,
				originalName: file.originalname,
			};

			await filesRef.set(fileData);

			delete fileData.userAddress;
			return res.status(200).json(fileData);
		} else {
			const exist = await filesSnapshot.val();

			if (exist.userAddress) delete exist.userAddress;
			return res.status(200).json(exist);
		}
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;
