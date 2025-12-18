// ===================== Bharat AI - app.js (FULL LOGIC) ===================== // Firebase Auth + Database + Typing Indicator + Voice Input + Backend API

// ------------------- 1. Firebase Setup ------------------- import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js"; import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js"; import { getDatabase, ref, push, set, get, child } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyBDhsD24pANIgqyBDYvkh5oePu8mXYSt54", authDomain: "bharatai-india-ka-apna-ai.firebaseapp.com", databaseURL: "https://bharatai-india-ka-apna-ai-default-rtdb.firebaseio.com", projectId: "bharatai-india-ka-apna-ai", storageBucket: "bharatai-india-ka-apna-ai.firebasestorage.app", messagingSenderId: "122551745946", appId: "1:122551745946:web:27705a83c2553db54e4e23" };

const app = initializeApp(firebaseConfig); const auth = getAuth(app); const db = getDatabase(app);

let currentUser = null; let currentChatId = null;

// ------------------- 2. Loader Handling ------------------- window.onload = () => { setTimeout(() => { document.getElementById("loader").classList.add("hidden"); document.getElementById("authScreen").classList.remove("hidden"); }, 1500); };

// ------------------- 3. Login / Register ------------------- const authBtn = document.getElementById("authBtn"); const toggleAuth = document.getElementById("toggleAuth"); let isLogin = true;

toggleAuth.onclick = () => { isLogin = !isLogin; document.getElementById("authTitle").innerText = isLogin ? "Login to Bharat AI" : "Create Account"; authBtn.innerText = isLogin ? "Login" : "Register"; };

authBtn.onclick = () => { const email = document.getElementById("authEmail").value; const pass = document.getElementById("authPass").value;

if (isLogin) {
    signInWithEmailAndPassword(auth, email, pass)
    .then(() => console.log("Logged in"))
    .catch(() => alert("Invalid credentials"));
} else {
    createUserWithEmailAndPassword(auth, email, pass)
    .then(() => console.log("Registered"))
    .catch(() => alert("Could not register"));
}

};

// Auto Login Check onAuthStateChanged(auth, (user) => { if (user) { currentUser = user.uid; document.getElementById("authScreen").classList.add("hidden"); document.getElementById("chatScreen").classList.remove("hidden"); loadChatHistory(); } });

// ------------------- 4. Sidebar ------------------- window.openSidebar = () => { document.getElementById("sidebar").style.left = "0"; document.getElementById("sidebarOverlay").classList.remove("hidden"); }; window.closeSidebar = () => { document.getElementById("sidebar").style.left = "-260px"; document.getElementById("sidebarOverlay").classList.add("hidden"); };

document.getElementById("menuBtn").onclick = openSidebar; document.getElementById("sidebarOverlay").onclick = closeSidebar;

// ------------------- 5. Chat Creation ------------------- window.createNewChat = () => { currentChatId = null; document.getElementById("chatBox").innerHTML = ""; closeSidebar(); };

// ------------------- 6. Send Message ------------------- window.sendMsg = () => { const input = document.getElementById("userInput"); const text = input.value.trim(); if (!text) return;

addMessageUI("user", text);
input.value = "";

showTyping(true);

setTimeout(async () => {
    const aiReply = await generateAIReply(text);

    addMessageUI("ai", aiReply);
    showTyping(false);

    saveMessage(text, aiReply);
    loadChatHistory();
}, 900);

};

// ------------------- 7. Typing Indicator ------------------- function showTyping(state) { document.getElementById("typingIndicator").classListstate ? "remove" : "add"; }

// ------------------- 8. UI Message Add ------------------- function addMessageUI(sender, text) { const chatBox = document.getElementById("chatBox"); chatBox.innerHTML += <div class="msg ${sender}"><div class="bubble">${text}</div></div>; chatBox.scrollTop = chatBox.scrollHeight; }

// ------------------- 9. Save Message to DB ------------------- function saveMessage(userMsg, aiMsg) { if (!currentChatId) { currentChatId = push(ref(db, "users/" + currentUser + "/chats"), {}).key; set(ref(db, users/${currentUser}/chats/${currentChatId}/title), userMsg); }

push(ref(db, `users/${currentUser}/chats/${currentChatId}/messages`), {
    user: userMsg,
    ai: aiMsg,
    time: Date.now()
});

}

// ------------------- 10. Load Chat History ------------------- async function loadChatHistory() { const snap = await get(ref(db, users/${currentUser}/chats)); const container = document.getElementById("chatHistory"); container.innerHTML = "";

if (!snap.exists()) return;

const data = snap.val();
for (const id in data) {
    const title = data[id].title || "New Chat";
    container.innerHTML += `
        <div onclick="openChat('${id}')">${title}</div>
    `;
}

}

// ------------------- 11. Load Existing Chat ------------------- window.openChat = async (chatId) => { currentChatId = chatId; closeSidebar();

document.getElementById("chatBox").innerHTML = "";

const snap = await get(ref(db, `users/${currentUser}/chats/${chatId}/messages`));
if (!snap.exists()) return;

const msgs = snap.val();
for (const mid in msgs) {
    addMessageUI("user", msgs[mid].user);
    addMessageUI("ai", msgs[mid].ai);
}

};

// ------------------- 12. AI Reply via Backend ------------------- async function generateAIReply(prompt) { try { const res = await fetch("http://localhost:8000/generate-text", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }); const data = await res.json(); return data.reply; } catch (e) { return "Error: Backend not responding"; } }

// ------------------- 13. Voice Input (Mode A: Tap to Start/Stop) ------------------- let recognition; if ("webkitSpeechRecognition" in window) { recognition = new webkitSpeechRecognition(); recognition.lang = "en-US"; recognition.continuous = false; recognition.interimResults = false;

recognition.onresult = (event) => {
    document.getElementById("userInput").value = event.results[0][0].transcript;
};

}

document.getElementById("voiceBtn").onclick = () => { if (!recognition) return alert("Voice not supported"); recognition.start();