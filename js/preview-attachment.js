async function displayPreview() {
	const params = new URLSearchParams(document.location.search);
	const commentIndex = params.get('comment');
	let imageUri;

	if (commentIndex) {
		const index = parseInt(commentIndex) - 1;
		await getActiveSession().then((session) => {
			if (index < session.comments.length) {
				imageUri = session.comments[index].attachment;
			} else {
				imageUri = null;
			}
		});
	} else {
		imageUri = await getLastScreenshot();
	}

	if (imageUri) {
		document.getElementById('error').style.display = 'none';
		document.getElementById('attachment').src = imageUri;
	} else {
		document.getElementById('image').style.display = 'none';
	}
}

function closePreview() {
	getActiveTab().then((tab) => {
		browser.tabs.remove(tab.id);
	});
}

document.getElementById('button-close').addEventListener('click', closePreview);
displayPreview()
