function getActiveSession() {
	// Return the active session from local storage
	return browser.storage.local.get('active_session').then((results) => {
		return results.active_session;
	});
}

function getLastScreenshot() {
	// Return the last screenshot from local storage
	return browser.storage.local.get('last_screenshot').then((results) => {
		return results.last_screenshot;
	});
}

function getActiveTab() {
	return browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
		return tabs[0];
	});
}

function updateBadge(session) {
	// Get remaining time of session
	const remaining = session.estimated_duration - session.duration;

	// Only update badge if non negative value
	if (remaining >= 0) {
		browser.browserAction.setBadgeText({text: remaining.toString()});
	} else {
		browser.browserAction.setBadgeText({text: '0'});
	}

	if (remaining <= 0) {
		browser.browserAction.setBadgeBackgroundColor({color: 'red'});
	} else {
		browser.browserAction.setBadgeBackgroundColor({color: 'green'});
	}
}

function trackSession(session) {
	// Create an alarm which handles tracking our session duration every minute
	browser.alarms.create('session', {periodInMinutes: 1});
	updateBadge(session);
}

function createCommentElement(comment, index) {
	// Create elements
	let div = document.createElement('div');
	let fieldset = document.createElement('fieldset');
	let legendComment = document.createElement('legend');
	let commentText = document.createElement('textarea');
	let tab = document.createElement('fieldset');
	let legendTab = document.createElement('legend');
	let tabTitle = document.createElement('p');
	let tabUrl = document.createElement('p');
	let dateCreated = document.createElement('p');
	let actions = document.createElement('div');
	let actionsUpdateComment = document.createElement('button');
	let actionsDeleteComment = document.createElement('button');
	let actionsPreviewAttachment = document.createElement('button');

	// Set attributes for elements
	div.setAttribute('class', 'container');
	div.setAttribute('id', 'comment');
	commentText.setAttribute('rows', '3');
	actions.setAttribute('role', 'group');
	actions.setAttribute('aria-label', 'Comment actions');
	actionsUpdateComment.style.background = 'lightsalmon';
	actionsDeleteComment.style.background = 'lightcoral';

	// Set values for elements
	const type = comment.type[0].toUpperCase() + comment.type.substring(1);
	legendComment.innerText = `Comment ${index + 1} (${type})`;
	commentText.value = comment.comment;
	legendTab.innerText = 'Tab';
	tabTitle.innerText = `Title: ${comment.tab.title}`;
	tabUrl.innerText = `Url: ${comment.tab.url}`;
	dateCreated.innerText = `Date: ${new Date(comment.datetime_created).toLocaleString()}`;
	actionsUpdateComment.innerText = 'Update Comment';
	actionsDeleteComment.innerText = 'Delete Comment';
	actionsPreviewAttachment.innerText = 'Preview Attachment';

	// Event listeners
	actionsUpdateComment.addEventListener('click', () => {
		updateCommentText(index, commentText.value);
		browser.tabs.reload();
	});
	actionsDeleteComment.addEventListener('click', () => {
		// Delete comment, and reload page to update list
		deleteComment(index);
		browser.tabs.reload();
	});
	actionsPreviewAttachment.addEventListener('click', () => {
		browser.tabs.create({
			url: `/preview-attachment.html?comment=${index + 1}`
		});
	});

	// Append elements
	tab.appendChild(legendTab);
	tab.appendChild(tabTitle);
	tab.appendChild(tabUrl);
	actions.appendChild(actionsUpdateComment);
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

	return div;
}

function updateCommentText(index, text) {
	getActiveSession().then((session) => {
		session.comments[index].comment = text;
		browser.storage.local.set({ active_session: session });
	});
}

function deleteComment(index) {
	getActiveSession().then((session) => {
		session.comments.splice(index, 1);
		browser.storage.local.set({ active_session: session });
	});
}
