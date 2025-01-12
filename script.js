import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvjpiz_IRdv8bu7YRg59jmRk7C0W3XdGA",
    authDomain: "card-ramadan.firebaseapp.com",
    databaseURL: "https://card-ramadan-default-rtdb.firebaseio.com",
    projectId: "card-ramadan",
    storageBucket: "card-ramadan.appspot.com",
    messagingSenderId: "89566741976",
    appId: "1:89566741976:web:3f3570e04042cd9b9bdead",
    measurementId: "G-8169ND4D3Q"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Generate user ID if not already saved in localStorage
let myUserId = localStorage.getItem("myUserId");
if (!myUserId) {
    myUserId = Math.random().toString(36).substring(2, 8);
    localStorage.setItem("myUserId", myUserId);
}
document.getElementById("my-id").textContent = `معرفي: ${myUserId}`;

// Save user to database
const userRef = ref(db, "users/" + myUserId);
set(userRef, { name: "أنا", id: myUserId });

// Handle Profile Image Upload
document.getElementById("upload-image").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        const img = document.getElementById("user-image");
        img.src = reader.result;
        update(userRef, { image: reader.result });
    };
    reader.readAsDataURL(file);
});

// Handle Username Update
document.getElementById("username").addEventListener("input", (e) => {
    update(userRef, { name: e.target.value });
});

// Game Timer Setup
let gameTime = 5 * 60; // 5 minutes in seconds
const timerElement = document.getElementById("game-timer");

function startGameTimer() {
    const interval = setInterval(() => {
        if (gameTime <= 0) {
            clearInterval(interval);
            alert("الوقت انتهى!");
            endGame();
        } else {
            const minutes = Math.floor(gameTime / 60);
            const seconds = gameTime % 60;
            timerElement.textContent = `الوقت: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            gameTime--;
        }
    }, 1000);
}

// Start game and timer
function startGameWithOpponent(id) {
    opponentId = id;
    document.getElementById("game-section").classList.remove("hidden");
    startGameTimer();
    alert("تم بدء الجولة مع المستخدم الآخر.");
}

// Handle game answers submission
document.getElementById("answer-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!opponentId) return alert("لا يوجد خصم الآن.");
    const answers = {
        name: document.getElementById("name").value,
        boy: document.getElementById("boy").value,
        girl: document.getElementById("girl").value,
        object: document.getElementById("object").value,
        animal: document.getElementById("animal").value,
        plant: document.getElementById("plant").value,
        player: myUserId
    };
    set(ref(db, `answers/${opponentId}`), answers);
    alert("تم إرسال إجاباتك للمراجعة.");
});

// Handle microphone button (Voice chat)
document.getElementById("microphone-btn").addEventListener("click", () => {
    // Start voice chat (can be implemented using WebRTC or an external API)
    alert("الميكروفون قيد التشغيل...");
});

// End game logic
document.getElementById("end-game").addEventListener("click", () => {
    endGame();
});

function endGame() {
    if (!opponentId) return alert("لا توجد جولة نشطة.");
    set(ref(db, `game-status/${opponentId}`), { status: "ended" });
    alert("تم إنهاء الجولة.");
}
