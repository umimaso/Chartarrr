function checkAlarm(alarm) {
	switch (alarm.name) {
		case 'session':
			browser.storage.local.get('active_session')
				.then(function (results) {
					let estimated = results.active_session.estimated_duration;
					let current = results.active_session.duration + 1;
					let remaining = estimated - current;

					// Update the running duration to local storage for the active session
					results.active_session.duration = current;
					browser.storage.local.set(results);

					// Update badge text with remaining duration only if non negative value
					if (remaining >= 0) {
						browser.browserAction.setBadgeText({text: remaining.toString()});
					}

					// If this is the last minute, update the badge color
					if (remaining == 0) {
						browser.browserAction.setBadgeBackgroundColor({color: 'red'});
					}
				});
			break;
	}
}

browser.alarms.onAlarm.addListener(checkAlarm);
