let comment_index = 0; // keep track of current comment index displayed

// Create a comment element for a given comment object, and replace the currently visible one
function displayComment(comment) {
	document.getElementById('comment-current').textContent = comment_index + 1;
	document.getElementById('comment').replaceWith(createCommentElement(comment, comment_index));
}

function displayEndSession() {
	getActiveSession().then((session) => {
		loadDetails(session);

		if (session.comments.length != 0) {
			// Display the first comment in the session
			document.getElementById('no-comments').style.display = 'none';
			document.getElementById('comment-total').textContent = session.comments.length;
			displayComment(session.comments[comment_index]);

			// Setup event listeners to navigate through the session comments
			document.getElementById('button-previous').addEventListener('click', () => {
				if (comment_index > 0) {
					comment_index--;
					displayComment(session.comments[comment_index]);
				}
			});
			document.getElementById('button-next').addEventListener('click', () => {
				if (comment_index < session.comments.length - 1) {
					comment_index++;
					displayComment(session.comments[comment_index]);
				}
			});
		} else {
			// Hide comments container due to the session not having any
			document.getElementById('comments').style.display = 'none';
		}
	});
}

function loadDetails(session) {
	document.getElementById('estimated-duration').value = session.estimated_duration + ' minutes';
	document.getElementById('actual-duration').value = session.duration + ' minutes';
	document.getElementById('start-date').value = session.datetime_started.toISOString().substring(0, 16);
	document.getElementById('end-date').value = new Date().toISOString().substring(0, 16);
}

function endSession() {
	//
}

function exportMarkdown() {
	//
}

function exportJson() {
	//
}

// Display a warning and another confirmation of ending the active session
function warnEndSession() {
	//
}

document.getElementById('button-export-md').addEventListener('click', exportMarkdown);
document.getElementById('button-export-json').addEventListener('click', exportJson);
document.getElementById('button-end').addEventListener('click', warnEndSession);
displayEndSession()
