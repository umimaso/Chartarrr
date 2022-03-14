async function displayPreview() {
	const params = new URLSearchParams(document.location.search);
	const commentIndex = params.get('comment');
	let imageUri;

	if (commentIndex) {
		const index = parseInt(commentIndex) - 1;
		imageUri = await browser.storage.local.get('active_session').then((results) => {
			if (index < results.active_session.comments.length) {
				return results.active_session.comments[index].attachment;
			} else {
				return null;
			}
		});
	} else {
		imageUri = await browser.storage.local.get('last_screenshot').then((results) => {
			return results.last_screenshot;
		});
	}

	if (imageUri) {
		document.getElementById('error').style.display = 'none';
		document.getElementById('attachment').src = imageUri;
	} else {
		document.getElementById('image').style.display = 'none';
	}
}

async function closePreview() {
	const activeTab = await browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		return tabs[0];
	});
	browser.tabs.remove(activeTab.id);
}

document.getElementById('button-close').addEventListener('click', closePreview);
displayPreview()
