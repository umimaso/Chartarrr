async function checkAlarm(alarm) {
	switch (alarm.name) {
		case 'session':
			// Update the running duration for the active session
			const session = await getActiveSession();
			session.duration = session.duration + 1;
			browser.storage.local.set({ active_session: session });
			updateBadge(session);
			break;
	}
}

browser.alarms.onAlarm.addListener(checkAlarm);
