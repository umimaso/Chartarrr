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
