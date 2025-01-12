
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

// Upload profile picture
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

// Load friends list
const friendsList = document.getElementById("friends-list");
onValue(ref(db, "users"), (snapshot) => {
    friendsList.innerHTML = "";
    snapshot.forEach((child) => {
        const user = child.val();
        if (user.id !== myUserId) {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${user.image || "default-avatar.png"}" alt="الصورة الشخصية" class="friend-image">
                ${user.name} (ID: ${user.id})
                <button class="invite-btn" data-id="${user.id}">دعوة</button>
            `;
            friendsList.appendChild(li);
        }
    });
});

// Handle friend invitation
friendsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("invite-btn")) {
        const invitedId = e.target.getAttribute("data-id");
        push(ref(db, "invitations/" + invitedId), {
            from: myUserId,
            name: "أنا"
        });
        alert("تم إرسال الدعوة.");
    }
});

// Handle incoming invitations
const invitationList = document.getElementById("invitation-list");
onValue(ref(db, "invitations/" + myUserId), (snapshot) => {
    invitationList.innerHTML = "";
    snapshot.forEach((child) => {
        const invitation = child.val();
        const li = document.createElement("li");
        li.textContent = `دعوة من: ${invitation.name}`;
        const acceptBtn = document.createElement("button");
        acceptBtn.textContent = "قبول";
        acceptBtn.addEventListener("click", () => {
            startGameWithOpponent(invitation.from);
        });
        li.appendChild(acceptBtn);
        invitationList.appendChild(li);
    });
});

// Game logic
let opponentId = null;

function startGameWithOpponent(id) {
    opponentId = id;
    document.getElementById("game-section").classList.remove("hidden");
    alert("تم بدء الجولة مع المستخدم الآخر.");
}

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

document.getElementById("end-game").addEventListener("click", () => {
    if (!opponentId) return alert("لا توجد جولة نشطة.");
    set(ref(db, `game-status/${opponentId}`), { status: "ended" });
    alert("تم إنهاء الجولة.");
});

// Handle end game notifications
onValue(ref(db, `game-status/${myUserId}`), (snapshot) => {
    const status = snapshot.val();
    if (status && status.status === "ended") {
        alert("تم إنهاء الجولة من قبل الخصم.");
        document.getElementById("game-section").classList.add("hidden");
        opponentId = null;
    }
});
