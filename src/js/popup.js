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

	message = message[0].toUpperCase() + message.substring(1);
	document.getElementById('message-text').textContent = message;
	messageElement.style.display = 'block';
	setTimeout(() => {
		messageElement.style.display = 'none';
	}, durationInMs);
}

function startSession() {
	// Get duration value and ensure it's valid
	const estDuration = Number(document.getElementById('duration').value);
	if (isNaN(estDuration) || estDuration < 1) {
		return;
	}

	// Init storage for the session
	// TODO: Refactor session creation to class
	const item = {
		active_session: {
			comments: [],
			datetime_started: new Date(),
			datetime_ended: null,
			duration: 0,
			estimated_duration: estDuration
		},
		last_screenshot: null
	}
	browser.storage.local.set(item);

	// Track session duration, and set browser badge
	trackSession(item.active_session);

	// Update popup display to show the active view
	displayPopup()
}

// Unused at the moment, not sure if I'll implement this functionality yet
function pauseSession() {
	browser.browserAction.setBadgeBackgroundColor({color: 'orange'});
}

async function addComment(event) {
	const commentElement = document.getElementById('comment');

	const type = event.target.value;
	const comment = commentElement.value;

	// Check if comment is empty
	if (comment == '') {
		displayMessage('No comment provided. Try again.', 1500)
		return;
	}

	// Add comment against the active session
	const session = await getActiveSession();
	const activeTab = await getActiveTab();

	session.comments.push({
		type: type,
		comment: comment,
		date_created: new Date(),
		tab: {
			title: activeTab.title,
			url: activeTab.url
		},
		attachment: await getLastScreenshot()
	});

	// Update storage with new comment added, and clear last screenshot key
	browser.storage.local.set({ last_screenshot: null });
	browser.storage.local.set({ active_session: session });

	// Set comment count text to amount of comments
	document.getElementById('comment-count').textContent = session.comments.length;

	// Update attachment actions display
	updateAttachmentMessage();

	// Display a modal temporarily to notify user of comment being added
	displayMessage(`${type} added.`, 1000);

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
		browser.storage.local.set({ last_screenshot: lastScreenshot });
	});

	// Update attachment actions display
	updateAttachmentMessage();
}

function previewAttachment() {
	browser.tabs.create({
		url: "/preview-attachment.html"
	});
}

async function deleteAttachment() {
	// Set last screenshot to null
	await browser.storage.local.set({ last_screenshot: null });

	// Update attachment actions display
	updateAttachmentMessage();
}

function viewSession() {
	browser.tabs.create({
		url: "/view-session.html"
	});
}

function endSession() {
	browser.tabs.create({
		url: "/end-session.html"
	});
}

document.getElementById('button-start').addEventListener('click', startSession);
document.getElementById('button-note').addEventListener('click', addComment);
document.getElementById('button-bug').addEventListener('click', addComment);
document.getElementById('button-clarification').addEventListener('click', addComment);
document.getElementById('button-screenshot').addEventListener('click', takeScreenshot);
document.getElementById('attachment-preview').addEventListener('click', previewAttachment);
document.getElementById('attachment-delete').addEventListener('click', deleteAttachment);
document.getElementById('button-details').addEventListener('click', viewSession);
document.getElementById('button-end').addEventListener('click', endSession);
displayPopup()
