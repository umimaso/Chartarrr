async function displayPreview() {
	const imageUri = await browser.storage.local.get('last_screenshot').then((results) => {
		return results.last_screenshot;
	});
	document.getElementById('attachment').src = imageUri;
}

async function closePreview() {
	const activeTab = await browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		return tabs[0];
	});
	browser.tabs.remove(activeTab.id);
}

document.getElementById('button-close').addEventListener('click', closePreview);
displayPreview()
