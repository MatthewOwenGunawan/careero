import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqzBgcZT_fXpFBbV76Vvkjpdt8M2q4C60",
    authDomain: "careero-login.firebaseapp.com",
    projectId: "careero-login",
    storageBucket: "careero-login.firebasestorage.app",
    messagingSenderId: "1034591118862",
    appId: "1:1034591118862:web:40f6b99c07a64420c4fe5f"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const messageBtn = document.getElementById("btn-message");
    const chatbox = document.getElementById("careero-chatbox");
    const closeBtn = document.getElementById("close-chatbox");
    const sendBtn = document.getElementById("send-btn");
    const chatInput = document.getElementById("chat-input");
    const messagesContainer = document.getElementById("chatbox-messages");
    const chatboxName = document.getElementById("chatbox-name");
    const chatboxAvatar = document.getElementById("chatbox-avatar");

    let currentUserUid = null;
    let targetUid = new URLSearchParams(window.location.search).get('uid'); 
    let unsubscribe = null; 

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserUid = user.uid;
        }
    });

    const getChatId = (uid1, uid2) => {
        return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
    };

    // --- FUNGSI UTAMA: MEMBUKA KOTAK CHAT ---
    const openChat = async (uid) => {
        if (!currentUserUid) return alert("Menunggu sinkronisasi data user...");
        if (currentUserUid === uid) return alert("Tidak bisa mengirim pesan ke profil sendiri.");

        targetUid = uid;
        
        if (chatbox) {
            chatbox.classList.remove("chatbox-hidden");
            chatbox.classList.add("chatbox-visible");
        }

        if (!chatboxName.textContent || chatboxName.textContent === "Loading...") {
            try {
                const targetRef = doc(db, "users", targetUid);
                const targetSnap = await getDoc(targetRef);
                if (targetSnap.exists()) {
                    chatboxName.textContent = targetSnap.data().name || "User";
                    chatboxAvatar.src = targetSnap.data().photo || "https://i.pravatar.cc/150";
                }
            } catch (e) {
                console.warn("Gagal menarik data profil untuk chatbox");
            }
        }

        const chatId = getChatId(currentUserUid, targetUid);
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        if (unsubscribe) unsubscribe();

        unsubscribe = onSnapshot(q, (snapshot) => {
            messagesContainer.innerHTML = ""; 
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                
                const rowDiv = document.createElement("div");
                rowDiv.classList.add("message-row");
                
                const msgDiv = document.createElement("div");
                msgDiv.classList.add("message-bubble");
                msgDiv.textContent = data.text;
                
                if (data.senderId === currentUserUid) {
                    rowDiv.classList.add("outgoing");
                    msgDiv.classList.add("message-sent");
                    rowDiv.appendChild(msgDiv);
                } else {
                    rowDiv.classList.add("incoming");
                    
                    const targetAvatarSrc = chatboxAvatar.src;
                    const avatarImg = document.createElement("img");
                    avatarImg.src = targetAvatarSrc;
                    avatarImg.classList.add("message-avatar");
                    
                    msgDiv.classList.add("message-received");
                    rowDiv.appendChild(avatarImg);
                    rowDiv.appendChild(msgDiv);
                }
                
                messagesContainer.appendChild(rowDiv);
            });
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    };

    if (messageBtn) {
        messageBtn.addEventListener("click", () => {
            if(document.getElementById("myProfileName") && document.getElementById("profilePhoto")) {
                chatboxName.textContent = document.getElementById("myProfileName").textContent;
                chatboxAvatar.src = document.getElementById("profilePhoto").src;
            }
            openChat(targetUid);
        });
    }

    window.addEventListener('openDirectMessage', (e) => {
        const friendId = e.detail.uid;
        openChat(friendId);
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (chatbox) {
                chatbox.classList.remove("chatbox-visible");
                chatbox.classList.add("chatbox-hidden");
            }
            if (unsubscribe) {
                unsubscribe();
                unsubscribe = null;
            }
        });
    }

    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (text !== "" && currentUserUid && targetUid) {
            const chatId = getChatId(currentUserUid, targetUid);
            const messagesRef = collection(db, "chats", chatId, "messages");
            const globalNotifRef = collection(db, "notifications");
            
            chatInput.value = ""; 
            
            let senderName = "Seseorang";
            let senderPhoto = "https://i.pravatar.cc/150";
            
            try {
                const userDocRef = doc(db, "users", currentUserUid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.name) senderName = userData.name;
                    if (userData.photo) senderPhoto = userData.photo;
                }
            } catch (err) {
                console.warn("Gagal tarik data profil diri sendiri dari Firebase");
            }
            
            await addDoc(messagesRef, {
                senderId: currentUserUid,
                text: text,
                timestamp: serverTimestamp() 
            });

            await addDoc(globalNotifRef, {
                receiverId: targetUid,
                senderId: currentUserUid,
                senderName: senderName,
                senderPhoto: senderPhoto,
                text: `Mengirim pesan: "${text}"`,
                type: "chat_message",
                isRead: false,
                createdAt: serverTimestamp()
            });
        }
    };

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }
});