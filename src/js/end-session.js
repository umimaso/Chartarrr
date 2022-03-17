let comment_index = 0; // keep track of current comment index displayed

// Create a comment element for a given comment object, and replace the currently visible one
function displayComment(comment) {
	document.getElementById('comment-current').textContent = comment_index + 1;
	document.getElementById('comment').replaceWith(createCommentElement(comment, comment_index));
}

function displayEndSession() {
	document.getElementById('export').style.display = 'none';
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

// Add the provided charter details onto the session before exporting it
function addCharterDetailsToSession(session) {
	// Update existing key values
	session.datetime_started = document.getElementById('start-date').value;
	session.datetime_ended = document.getElementById('end-date').value;
	session.duration = document.getElementById('actual-duration').value;
	session.estimated_duration = document.getElementById('estimated-duration').value;

	// Add new key values
	session = {
		...session,
		title: document.getElementById('charter').value,
		environment: document.getElementById('environment').value
	}
	if (session.title == '') {
		session.title = 'NA';
	}

	return session;
}

// Downloads the session screenshots, along with given content in the given format
function downloadExport(session, content, format) {
	// Create zip and add files
	const zip = new JSZip();
	zip.file(`content.${format}`, content);
	session.comments.forEach((comment, index) => {
		if (comment.attachment) {
			const imageBase64 = comment.attachment.replace(/^data:image\/[a-z]+;base64,/, '');
			const imageFilename = `${index + 1} - ${comment.date_created.toISOString().substring(0, 16)}.png`;
			zip.file(`screenshots/${imageFilename}`, imageBase64, {base64: true});
		}
	});

	// Generate and save
	zip.generateAsync({type: 'blob'}).then((blob) => {
		const zipFilename = `Chater - ${session.datetime_started} - ${session.title}.zip`
		saveAs(blob, zipFilename);
	});
}

function exportMarkdown() {
	document.getElementById('export').style.display = 'initial';
	getActiveSession().then((session) => {
		session = addCharterDetailsToSession(session);
		let text = `Title: ${session.title}

Description:
**Pre-Testing Notes:**
...

**Session:**
Estimated Duration: *${session.estimated_duration}*
Actual Duration: *${session.duration}*
Started: *${session.datetime_started}*
Ended: *${session.datetime_ended}*

**Environment:**
${session.environment}

**Test Notes:**
`;

		session.comments.forEach((comment) => {
			let textComment = '';
			if (comment.type == 'bug') {
				textComment += '*Bug*: ';
			} else if (comment.type == 'clarification') {
				textComment += '*Clarification*: ';
			}

			textComment += `${comment.comment}

`;
			text += textComment;
		});

		document.getElementById('export-content').textContent = text;

		// Add event listener for download export
		document.getElementById('button-export-download').addEventListener('click', () => {
			downloadExport(session, text, 'md');
		});
	});
}

// Displays the raw active session object for export, along with a download button
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
