// If we're on a Chromium browser, import scripts to service worker
if (typeof browser != 'object') {
	importScripts('browser-polyfill.min.js', 'helpers.js');
}

browser.alarms.onAlarm.addListener(async () => {
	// Update the running duration for the active session
	const session = await getActiveSession();
	session.duration = session.duration + 1;
	browser.storage.local.set({ active_session: session });
	updateBadge(session);
});

// Restarts the background alarm if it should be running
// This is due to the alarm ending when the browser session is restarted
async function alarmAlive() {
	const session = await getActiveSession();
	if (session) {
		// Check if the alarm is already running
		const alarm = await browser.alarms.get('session').then((alarm) => { return alarm; });

		// Start tracking the session again if the alarm isn't found
		if (!alarm) {
			trackSession(session);
		} else {
			updateBadge(session);
		}
	}
}

alarmAlive();
