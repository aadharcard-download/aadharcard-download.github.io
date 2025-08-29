import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVHe2KxB7pHrh29LCvKUVIELp4Bt_6upE",
  authDomain: "board-22a60.firebaseapp.com",
  databaseURL: "https://board-22a60-default-rtdb.firebaseio.com",
  projectId: "board-22a60",
  storageBucket: "board-22a60.firebasestorage.app",
  messagingSenderId: "426670273892",
  appId: "1:426670273892:web:03cd8b59ec2c8000b7b671",
  measurementId: "G-8Q1C7V9J9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const EXPIRY_DAYS = 90;

function showStatus(element, message, isSuccess) {
  element.textContent = message;
  element.className = isSuccess ? 'status success' : 'status error';
  element.style.display = 'block';

  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const icon = hamburger.querySelector('i');
  if (navLinks.classList.contains('active')) {
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-times');
  } else {
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
  }
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    const icon = hamburger.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
  });
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const text = document.getElementById('inputText').value.trim();
  const saveStatus = document.getElementById('saveStatus');

  if (!text) {
    showStatus(saveStatus, "Please enter some text first.", false);
    return;
  }

  const code = generateCode();
  const expiry = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  // Save to Firebase Realtime Database
  set(ref(database, 'clips/' + code), {
    text: text,
    expiry: expiry,
    created: Date.now()
  })
  .then(() => {
    document.getElementById('generatedCode').textContent = code;
    document.getElementById('copyCodeBtn').style.display = 'block';
    document.getElementById('retrievedText').textContent = '-';
    document.getElementById('codeInput').value = '';
    document.getElementById('inputText').value = '';
    showStatus(saveStatus, "Text saved successfully! Use the code to retrieve it.", true);
  })
  .catch((error) => {
    showStatus(saveStatus, "Error saving text: " + error.message, false);
  });
});

document.getElementById('retrieveBtn').addEventListener('click', () => {
  const code = document.getElementById('codeInput').value.trim();
  const retrieveStatus = document.getElementById('retrieveStatus');

  if (!code) {
    showStatus(retrieveStatus, "Please enter a code to retrieve.", false);
    return;
  }

  // Retrieve from Firebase Realtime Database
  get(child(ref(database), 'clips/' + code))
  .then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.expiry < Date.now()) {
        document.getElementById('retrievedText').textContent = "";
        document.getElementById('copyTextBtn').style.display = 'none';
        showStatus(retrieveStatus, "This code has expired.", false);
        return;
      }
      document.getElementById('retrievedText').textContent = data.text;
      document.getElementById('copyTextBtn').style.display = 'block';
      showStatus(retrieveStatus, "Text retrieved successfully!", true);
    } else {
      document.getElementById('retrievedText').textContent = "";
      document.getElementById('copyTextBtn').style.display = 'none';
      showStatus(retrieveStatus, "No text found for this code.", false);
    }
  })
  .catch((error) => {
    showStatus(retrieveStatus, "Error retrieving text: " + error.message, false);
  });
});

document.getElementById('copyCodeBtn').addEventListener('click', () => {
  const code = document.getElementById('generatedCode').textContent;
  if (code && code !== '-') {
    copyToClipboard(code);
    showStatus(document.getElementById('saveStatus'), "Code copied to clipboard!", true);
  }
});

document.getElementById('copyTextBtn').addEventListener('click', () => {
  const text = document.getElementById('retrievedText').textContent;
  if (text && text !== '-') {
    copyToClipboard(text);
    showStatus(document.getElementById('retrieveStatus'), "Text copied to clipboard!", true);
  }
});
