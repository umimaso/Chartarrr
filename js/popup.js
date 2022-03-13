function getActiveSession() {
	// Return the active session from local storage
	return browser.storage.local.get('active_session').then((results) => {
		return results.active_session;
	});
}

function displayPopup() {
	getActiveSession().then((session) => {
		if (session) {
			// Show active view
			document.getElementById('start').style.display = 'none';
			document.getElementById('active').style.display = 'initial';

			// Set comment count
			document.getElementById('comment-count-text').textContent = session.comments.length;
		} else {
			// Show start view
			document.getElementById('start').style.display = 'initial';
			document.getElementById('active').style.display = 'none';

			// Auto focus duration input
			document.getElementById('duration').focus();
		}
	});
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
		}
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
	const messageElement = document.getElementById('message');
	const messageElementText = document.getElementById('message-text');
	const commentCountTextElement = document.getElementById('comment-count-text');

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

		session.comments.push({
			type: type,
			comment: comment,
			date_created: now,
			tab: {
				title: activeTab.title,
				url: activeTab.url
			}
		});

		// Update with comment added
		const item = { active_session: session };
		browser.storage.local.set(item);

		// Set comment count text to amount of comments
		commentCountTextElement.textContent = session.comments.length;
	});

	// Display a modal temporialy to notify user of comment being added
	messageElementText.textContent = `${type} added.`
	messageElement.style.display = 'block';

	// Hide modal, and enable the button again after a second
	setTimeout(() => {
		event.target.disabled = false;
		messageElement.style.display = 'none';
	}, 1000);

	// Empty the comment box text, and auto focus for next use
	commentElement.value = '';
	commentElement.focus();
}

document.querySelector('#button-start').addEventListener('click', startSession);
document.querySelector('#button-note').addEventListener('click', addComment);
document.querySelector('#button-bug').addEventListener('click', addComment);
document.querySelector('#button-clarification').addEventListener('click', addComment);
displayPopup()
