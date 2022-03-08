function isActive() {
	// Check local storage to determine if a session is active
	return browser.storage.local.get('active_session')
		.then(function (results) {
			if (results.active_session) {
				return true;
			} else {
				return false;
			}
		});
}

function displayPopup() {
	isActive().then(function (value) {
		if (value) {
			// Hide start session container
			document.querySelector('#start').style.display = 'none';
		} else {
			// Hide active session container
			document.querySelector('#active').style.display = 'none';
		}
	});
}

function startSession() {
	// Get duration value from form
	let estDuration = Number(document.getElementById('duration').value);
	
	// Check if an invalid number was given
	// Exit early, the HTML form validation will highlight the field red
	if (isNaN(estDuration) || estDuration < 1) {
		return;
	}

	// Create an alarm which handles tracking our session duration every minute
	browser.alarms.create('session', {periodInMinutes: 1});

	// Store estimated duration to local storage for the active session
	let item = {
		active_session: {
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

document.querySelector('#button-new-session').addEventListener('click', startSession);
displayPopup()
