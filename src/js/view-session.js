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
		let actions = document.createElement('div');
		let actionsDeleteComment = document.createElement('button');
		let actionsPreviewAttachment = document.createElement('button');

		// Set attributes for elements
		div.setAttribute('class', 'container');
		actions.setAttribute('role', 'group');
		actions.setAttribute('aria-label', 'Comment actions');
		actionsDeleteComment.style.background = 'lightcoral';

		// Set values for elements
		const type = comment.type[0].toUpperCase() + comment.type.substr(1);
		legendComment.innerText = `Comment ${index + 1} (${type})`;
		commentText.innerText = comment.comment;
		legendTab.innerText = 'Tab';
		tabTitle.innerText = `Title: ${comment.tab.title}`;
		tabUrl.innerText = `Url: ${comment.tab.url}`;
		dateCreated.innerText = `Date: ${comment.date_created.toLocaleString()}`;
		actionsDeleteComment.innerText = 'Delete Comment';
		actionsPreviewAttachment.innerText = 'Preview Attachment';

		// Event listeners
		actionsDeleteComment.addEventListener('click', () => {
			// Delete comment, and reload page to update list
			deleteComment(index);
			browser.tabs.reload();
		})
		actionsPreviewAttachment.addEventListener('click', () => {
			browser.tabs.create({
				url: `/preview-attachment.html?comment=${index + 1}`
			});
		});

		// Append elements
		tab.appendChild(legendTab);
		tab.appendChild(tabTitle);
		tab.appendChild(tabUrl);
		actions.appendChild(actionsDeleteComment);
		if (comment.attachment) {
			actions.appendChild(actionsPreviewAttachment);
		}
		fieldset.appendChild(legendComment);
		fieldset.appendChild(commentText);
		fieldset.appendChild(tab);
		fieldset.appendChild(document.createElement('br'));
		fieldset.appendChild(dateCreated);
		fieldset.appendChild(actions);
		div.appendChild(fieldset);
		document.getElementById('comments').appendChild(div);
	});
}

displaySession()
