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

function updateAttachmentMessage() {
	getLastScreenshot().then((lastScreenshot) => {
		if (lastScreenshot) {
			document.getElementById('attachment-box').style.display = 'block';
		} else {
			document.getElementById('attachment-box').style.display = 'none';
		}
	});
}

function displayPopup() {
	getActiveSession().then((session) => {
		if (session) {
			// Show active view
			document.getElementById('start').style.display = 'none';
			document.getElementById('active').style.display = 'initial';

			// Set comment count
			document.getElementById('comment-count').textContent = session.comments.length;

			// Display attachment actions if image is present
			updateAttachmentMessage();
		} else {
			// Show start view
			document.getElementById('start').style.display = 'initial';
			document.getElementById('active').style.display = 'none';

			// Auto focus duration input
			document.getElementById('duration').focus();
		}
	});
}

function displayMessage(message, durationInMs) {
	const messageElement = document.getElementById('message');
	const messageElementText = document.getElementById('message-text');

	message = message[0].toUpperCase() + message.substr(1);
	messageElementText.textContent = message;
	messageElement.style.display = 'block';
	setTimeout(() => {
		messageElement.style.display = 'none';
	}, durationInMs);
}

function startSession() {
	// Get duration value from form
	const estDuration = Number(document.getElementById('duration').value);

	// Check if an invalid number was given
	// Exit early, the HTML form validation will highlight the field red
	if (isNaN(estDuration) || estDuration < 1) {
		return;
	}

	// Create an alarm which handles tracking our session duration every minute
	browser.alarms.create('session', {periodInMinutes: 1});

	// Create an active session object to use, and store estimated duration against it
	// TODO: Refactor session creation to class
	const item = {
		active_session: {
			comments: [],
			estimated_duration: estDuration,
			duration: 0,
			paused: false
		},
		last_screenshot: null
	}
	browser.storage.local.set(item);

	// Set browser badge text to given duration
	browser.browserAction.setBadgeBackgroundColor({color: 'green'});
	browser.browserAction.setBadgeText({text: estDuration.toString()});

	// Update popup display to show the active session view
	displayPopup()
}

// Unused at the moment, not sure if I'll implement this functionality yet
function pauseSession() {
	browser.browserAction.setBadgeBackgroundColor({color: 'orange'});
}

async function addComment(event) {
	const commentElement = document.getElementById('comment');
	const commentCountElement = document.getElementById('comment-count');

	const type = event.target.value;
	const comment = commentElement.value;

	// Disable the button while comment is added
	event.target.disabled = true;

	// Add comment against the active session
	await getActiveSession().then(async (session) => {
		const now = new Date();
		const activeTab = await browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
			return tabs[0];
		});

		// Get last screenshot imageUri and clear the value back to null
		const lastScreenshot = await getLastScreenshot();
		browser.storage.local.set({ last_screenshot: null });

		session.comments.push({
			type: type,
			comment: comment,
			date_created: now,
			tab: {
				title: activeTab.title,
				url: activeTab.url
			},
			attachment: lastScreenshot
		});

		// Update with comment added
		const item = { active_session: session };
		browser.storage.local.set(item);

		// Set comment count text to amount of comments
		commentCountElement.textContent = session.comments.length;
	});

	// Update attachment actions display
	updateAttachmentMessage();

	// Enable the button now the comment has been made
	event.target.disabled = false;

	// Display a modal temporarily to notify user of comment being added
	const message = `${type} added.`;
	displayMessage(message, 1000);

	// Empty the comment box text, and auto focus for next use
	commentElement.value = '';
	commentElement.focus();
}

// Store screenshot in storage for next saved comment to use
// Replaces previous stored image
async function takeScreenshot() {
	const imageUri = await browser.tabs.captureVisibleTab().then((imageUri) => {
		return imageUri;
	});

	await getLastScreenshot().then(async (lastScreenshot) => {
		// Display a modal temporarily to notify user
		if (lastScreenshot == null) {
			displayMessage('Screenshot of tab attached.', 1500);
		} else {
			displayMessage('Previous image overriden.', 1500);
		}

		// Update last screenshot to image uri taken
		lastScreenshot = imageUri;
		const item = { last_screenshot: lastScreenshot };
		browser.storage.local.set(item);
	});

	// Update attachment actions display
	updateAttachmentMessage();
}

async function previewAttachment() {
	await browser.tabs.create({
		url: "/preview-attachment.html"
	});
}

async function deleteAttachment() {
	// Set last screenshot to null
	const item = { last_screenshot: null };
	await browser.storage.local.set(item);

	// Update attachment actions display
	updateAttachmentMessage();
}

document.getElementById('button-start').addEventListener('click', startSession);
document.getElementById('button-note').addEventListener('click', addComment);
document.getElementById('button-bug').addEventListener('click', addComment);
document.getElementById('button-clarification').addEventListener('click', addComment);
document.getElementById('button-screenshot').addEventListener('click', takeScreenshot);
document.getElementById('attachment-preview').addEventListener('click', previewAttachment);
document.getElementById('attachment-delete').addEventListener('click', deleteAttachment);
displayPopup()
