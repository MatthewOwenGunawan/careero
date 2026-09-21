import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    const dmToggleBtn = document.getElementById("dmToggleBtn");
    const dmSidebar = document.getElementById("dm-sidebar");
    const dmCloseBtn = document.getElementById("dmCloseBtn");
    const dmList = document.getElementById("dmList");
    
    const dmBadge = document.getElementById("dm-badge"); 

    if (dmToggleBtn && dmSidebar && dmCloseBtn) {
        dmToggleBtn.addEventListener("click", () => {
            dmSidebar.classList.add("active");
        });
        dmCloseBtn.addEventListener("click", () => {
            dmSidebar.classList.remove("active");
        });
    }

    onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        if (dmBadge) {
            const notifRef = collection(db, "notifications");
            const qNotif = query(
                notifRef, 
                where("receiverId", "==", user.uid), 
                where("isRead", "==", false)
            );

            onSnapshot(qNotif, (snapshot) => {
                let unreadChatCount = 0;
                
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    if (data.type === "chat_message") {
                        unreadChatCount++;
                    }
                });

                if (unreadChatCount > 0) {
                    dmBadge.textContent = unreadChatCount > 99 ? "99+" : unreadChatCount; 
                    dmBadge.style.display = "flex";
                } else {
                    dmBadge.style.display = "none";
                }
            });
        }

        const connRef = collection(db, "connections");
        const qConn = query(connRef, where("participants", "array-contains", user.uid), where("status", "==", "connected"));

        onSnapshot(qConn, (snapshot) => {
            if (dmList) dmList.innerHTML = "";

            if (snapshot.empty) {
                if (dmList) dmList.innerHTML = `
                    <div style="text-align: center; margin-top: 50px; color: #888;">
                        <i class="fa-solid fa-user-group" style="font-size: 40px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <p>Belum ada teman obrolan.</p>
                        <p style="font-size: 12px;">Mulai koneksi dengan kandidat lain!</p>
                    </div>`;
                return;
            }

            snapshot.forEach(async (docSnap) => {
                const data = docSnap.data();
                
                const friendId = data.participants.find(id => id !== user.uid);

                const friendRef = doc(db, "users", friendId);
                const friendSnap = await getDoc(friendRef);

                if (friendSnap.exists() && dmList) {
                    const friendData = friendSnap.data();
                    const friendName = friendData.name || "User";
                    const friendPhoto = friendData.photo || "https://i.pravatar.cc/150";

                    const item = document.createElement("div");
                    item.className = "dm-item";
                    item.innerHTML = `
                        <img src="${friendPhoto}" class="dm-avatar" alt="${friendName}">
                        <div class="dm-info">
                            <span class="dm-name">${friendName}</span>
                            <span class="dm-preview">Ketuk untuk mulai obrolan</span>
                        </div>
                        <div class="unread-dot"></div>
                    `;

                    const notifRef = collection(db, "notifications");
                    const qUnread = query(
                        notifRef,
                        where("receiverId", "==", user.uid),
                        where("senderId", "==", friendId),
                        where("type", "==", "chat_message"),
                        where("isRead", "==", false)
                    );

                    let unreadDocs = [];

                    onSnapshot(qUnread, (unreadSnap) => {
                        unreadDocs = unreadSnap.docs; 
                        const previewSpan = item.querySelector(".dm-preview");

                        if (!unreadSnap.empty) {
                            item.classList.add("unread"); 
                            if (previewSpan) {
                                previewSpan.textContent = "Pesan baru masuk!";
                                previewSpan.style.color = "#111"; 
                            }
                        } else {
                            item.classList.remove("unread"); 
                            if (previewSpan) {
                                previewSpan.textContent = "Ketuk untuk mulai obrolan";
                                previewSpan.style.color = "#888";
                            }
                        }
                    });

                    item.addEventListener("click", async () => {
                        dmSidebar.classList.remove("active"); 
                        
                        const chatbox = document.getElementById("careero-chatbox");
                        const chatName = document.getElementById("chatbox-name");
                        const chatAvatar = document.getElementById("chatbox-avatar");

                        if (chatbox && chatName && chatAvatar) {
                            chatbox.classList.remove("chatbox-hidden");
                            chatbox.classList.add("chatbox-visible");
                            
                            chatName.textContent = friendName;
                            chatAvatar.src = friendPhoto;

                            window.dispatchEvent(new CustomEvent('openDirectMessage', { 
                                detail: { uid: friendId } 
                            }));
                        }

                        if (unreadDocs.length > 0) {
                            try {
                                unreadDocs.forEach(async (unReadDoc) => {
                                    const docRef = doc(db, "notifications", unReadDoc.id);
                                    await updateDoc(docRef, { isRead: true });
                                });
                            } catch (error) {
                                console.error("Gagal mengubah status pesan:", error);
                            }
                        }
                    });

                    dmList.appendChild(item);
                }
            });
        });
    });
});