import axios from 'axios';
import fs from 'fs';

const form = new FormData();

form.append('file', new Blob([fs.readFileSync('./wife.jpg')], { type: 'image/jpeg' }), 'wife.jpg');

const { data } = await axios.post('http://localhost:3000/upload', form, {
	headers: {
		'Content-Type': 'multipart/form-data',
	},
});

console.log(data);