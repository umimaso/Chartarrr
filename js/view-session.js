async function displaySession() {
	const session = await getActiveSession();

	document.getElementById('estimated-duration').textContent = session.estimated_duration;
	document.getElementById('duration').textContent = session.duration;

	session.comments.forEach((comment, index) => {
		// Create elements
		let div = document.createElement('div');
		let fieldset = document.createElement('fieldset');
		let legendComment = document.createElement('legend');
		let commentText = document.createElement('pre');
		let tab = document.createElement('fieldset');
		let legendTab = document.createElement('legend');
		let tabTitle = document.createElement('p');
		let tabUrl = document.createElement('p');
		let dateCreated = document.createElement('p');
		let previewAttachment = document.createElement('button');

		// Set attributes for elements
		div.setAttribute('class', 'container');

		// Set values for elements
		const type = comment.type[0].toUpperCase() + comment.type.substr(1);
		legendComment.innerText = `Comment ${index + 1} (${type})`;
		commentText.innerText = comment.comment;
		legendTab.innerText = 'Tab';
		tabTitle.innerText = `Title: ${comment.tab.title}`;
		tabUrl.innerText = `Url: ${comment.tab.url}`;
		dateCreated.innerText = `Date: ${comment.date_created.toLocaleString()}`;
		previewAttachment.innerText = 'Preview Attachment';

		// Append elements
		tab.appendChild(legendTab);
		tab.appendChild(tabTitle);
		tab.appendChild(tabUrl);
		fieldset.appendChild(legendComment);
		fieldset.appendChild(commentText);
		fieldset.appendChild(tab);
		fieldset.appendChild(document.createElement('br'));
		fieldset.appendChild(dateCreated);
		if (comment.attachment) {
			previewAttachment.addEventListener('click', () => {
				browser.tabs.create({
					url: `/preview-attachment.html?comment=${index + 1}`
				});
			});
			fieldset.appendChild(previewAttachment);
		}
		div.appendChild(fieldset);
		document.getElementById('comments').appendChild(div);
	});
}

displaySession()
