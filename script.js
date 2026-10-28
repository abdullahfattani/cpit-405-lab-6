// Initial default counters
const INITIAL_LIKES = 100;
const INITIAL_DISLIKES = 20;

let likesCount = INITIAL_LIKES;
let dislikesCount = INITIAL_DISLIKES;
let commentsArray = [];

// DOM Elements
const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const likeCountSpan = document.getElementById('likeCount');
const dislikeCountSpan = document.getElementById('dislikeCount');
const voteStatus = document.getElementById('voteStatus');
const commentInput = document.getElementById('commentInput');
const submitBtn = document.getElementById('submitBtn');
const commentsList = document.getElementById('commentsList');
const resetBtn = document.getElementById('resetBtn');

// --- Helper Functions for Cookies ---

function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
    const cookieName = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(cookieName) === 0) {
            return decodeURIComponent(c.substring(cookieName.length, c.length));
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// --- Load State from Cookies on Page Load ---

function initApp() {
    // 1. Check Vote Cookie
    const userVote = getCookie('userVote');
    likesCount = INITIAL_LIKES;
    dislikesCount = INITIAL_DISLIKES;

    if (userVote === 'like') {
        likesCount++;
        likeBtn.classList.add('active-like');
        disableVoteButtons("You have already liked this.");
    } else if (userVote === 'dislike') {
        dislikesCount++;
        dislikeBtn.classList.add('active-dislike');
        disableVoteButtons("You have already disliked this.");
    } else {
        enableVoteButtons();
    }

    // 2. Check Comments Cookie
    const savedComments = getCookie('userComments');
    if (savedComments) {
        try {
            commentsArray = JSON.parse(savedComments);
        } catch (e) {
            commentsArray = [];
        }
        // Prevent user from commenting multiple times if they already commented
        if (commentsArray.length > 0) {
            disableCommentSection();
        }
    } else {
        commentsArray = [];
        enableCommentSection();
    }

    updateUI();
}

// --- UI Update Functions ---

function updateUI() {
    likeCountSpan.textContent = likesCount;
    dislikeCountSpan.textContent = dislikesCount;

    // Render Comments
    commentsList.innerHTML = '';
    commentsArray.forEach(comment => {
        const li = document.createElement('li');
        li.textContent = comment;
        commentsList.appendChild(li);
    });
}

function disableVoteButtons(message) {
    likeBtn.disabled = true;
    dislikeBtn.disabled = true;
    voteStatus.textContent = message;
}

function enableVoteButtons() {
    likeBtn.disabled = false;
    dislikeBtn.disabled = false;
    likeBtn.classList.remove('active-like');
    dislikeBtn.classList.remove('active-dislike');
    voteStatus.textContent = '';
}

function disableCommentSection() {
    commentInput.disabled = true;
    submitBtn.disabled = true;
    commentInput.placeholder = "You have already submitted a comment.";
}

function enableCommentSection() {
    commentInput.disabled = false;
    submitBtn.disabled = false;
    commentInput.placeholder = "Write a comment...";
}

function triggerAnimation(button) {
    button.classList.remove('animate-pop');
    void button.offsetWidth; // trigger reflow
    button.classList.add('animate-pop');
}

// --- Event Listeners ---

likeBtn.addEventListener('click', () => {
    if (getCookie('userVote')) return;

    likesCount++;
    setCookie('userVote', 'like');
    likeBtn.classList.add('active-like');
    triggerAnimation(likeBtn);
    disableVoteButtons("Thanks for your Like!");
    updateUI();
});

dislikeBtn.addEventListener('click', () => {
    if (getCookie('userVote')) return;

    dislikesCount++;
    setCookie('userVote', 'dislike');
    dislikeBtn.classList.add('active-dislike');
    triggerAnimation(dislikeBtn);
    disableVoteButtons("Thanks for your feedback!");
    updateUI();
});

submitBtn.addEventListener('click', () => {
    const commentText = commentInput.value.trim();

    if (commentText === '') {
        alert("Please write a comment before submitting.");
        return;
    }

    if ( getCookie('userComments') ) {
        alert("You have already submitted a comment!");
        return;
    }

    commentsArray.push(commentText);
    setCookie('userComments', JSON.stringify(commentsArray));
    
    commentInput.value = '';
    disableCommentSection();
    updateUI();
});

// Allow pressing "Enter" in input field to submit
commentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitBtn.click();
    }
});

resetBtn.addEventListener('click', () => {
    const confirmReset = confirm("Are you sure you want to reset your vote and clear comments?");
    if (!confirmReset) return;

    // Delete cookies
    deleteCookie('userVote');
    deleteCookie('userComments');

    // Reset state
    likesCount = INITIAL_LIKES;
    dislikesCount = INITIAL_DISLIKES;
    commentsArray = [];

    // Re-enable inputs and update UI
    enableVoteButtons();
    enableCommentSection();
    updateUI();
});

// Run on page load
window.addEventListener('DOMContentLoaded', initApp);