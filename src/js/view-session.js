async function displaySession() {
	const session = await getActiveSession();

	if (session) {
		// Hide no active session warning
		document.getElementById('no-session').style.display = 'none';

		document.getElementById('start-date').textContent = new Date(session.datetime_started).toLocaleString();
		document.getElementById('estimated-duration').textContent = session.estimated_duration;
		document.getElementById('duration').textContent = session.duration;
		document.getElementById('comment-count').textContent = session.comments.length;

		session.comments.forEach((comment, index) => {
			document.getElementById('comments').appendChild(createCommentElement(comment, index));
		});
	} else {
		document.getElementById('session').style.display = 'none';
	}
}

displaySession()
