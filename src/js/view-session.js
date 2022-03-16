async function displaySession() {
	const session = await getActiveSession();

	document.getElementById('start-date').textContent = session.datetime_started.toLocaleString();
	document.getElementById('estimated-duration').textContent = session.estimated_duration;
	document.getElementById('duration').textContent = session.duration;
	document.getElementById('comment-count').textContent = session.comments.length;

	session.comments.forEach((comment, index) => {
		document.getElementById('comments').appendChild(createCommentElement(comment, index));
	});
}

displaySession()
