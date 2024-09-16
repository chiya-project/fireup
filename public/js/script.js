const fileInput = document.querySelector('.file-input');
const progressArea = document.querySelector('.progress');
const uploadedArea = document.querySelector('.uploaded');

document.querySelector('form').addEventListener('click', function () {
	fileInput.click();
});

fileInput.addEventListener('change', () => {
	let xhr = new XMLHttpRequest();
	let form = new FormData();
	let file = fileInput.files[0];

	form.append('file', file);

	xhr.open('POST', '/upload');

	xhr.upload.addEventListener('load', e => {
		let percentLoaded = Math.round((e.loaded / e.total) * 100);

		progressArea.innerHTML = `<li class="row"><i class="fas fa-file-alt"></i><div class="content"><div class="details"><span class="name">${file.name} • Uploading</span><span class="percent">${percentLoaded}%</span></div><div class="progress-bar"><div class="progress" style="width: ${percentLoaded}%"></div></div></div></li>`;
	});

	xhr.onload = function () {
		progressArea.innerHTML = '';
		if (xhr.status === 200) {
			if (uploadedArea.children.length >= 3) {
				uploadedArea.removeChild(uploadedArea.firstChild);
			}

			const data = JSON.parse(xhr.responseText);

			const li = document.createElement('li');
			
			li.className = 'row';
			li.innerHTML = `<i class="fas fa-file-alt"></i>
		<div class="content">
			<div class="details">
				<span class="name"><a href="${location.origin}/${data.hash}" target="_blank">${data.originalName}</a></span>
				<span class="size">${formatFileSize(data.size)}</span>
			</div>
		</div>`;

			uploadedArea.appendChild(li);
		} else {
			const { error } = JSON.parse(xhr.responseText);
			uploadedArea.innerHTML = `<li class="row"><i class="fas fa-file-alt"></i><div class="content"><div class="details"><span class="name">${error}</span></div></div><i class="fas fa-times close"></i></li>`;
		}
	};

	xhr.onerror = function () {
		progressArea.innerHTML = '';
		uploadedArea.innerHTML = `<li class="row"><i class="fas fa-file-alt"></i><div class="content"><div class="details"><span class="name">${file.name} • Failed</span></div></div><i class="fas fa-times close"></i></li>`;
	};

	xhr.send(form);
});

function formatFileSize(bytes) {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let index = 0;
	while (bytes >= 1024 && index < units.length - 1) {
		bytes /= 1024;
		index++;
	}
	return `${bytes.toFixed(2)} ${units[index]}`;
}
