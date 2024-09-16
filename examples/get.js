import axios from 'axios';

const { data } = await axios.get('http://localhost:3000/:fileID', {
	params: {
		json: '', // Optional
	},
});

console.log(data);
