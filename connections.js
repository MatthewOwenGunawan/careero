import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, deleteDoc, updateDoc, onSnapshot, collection, query, where, serverTimestamp, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqzBgcZT_fXpFBbV76Vvkjpdt8M2q4C60",
    authDomain: "careero-login.firebaseapp.com",
    projectId: "careero-login",
    storageBucket: "careero-login.firebasestorage.app",
    messagingSenderId: "1034591118862",
    appId: "1:1034591118862:web:40f6b99c07a64420c4fe5f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const connectionCountEl = document.getElementById("connectionCount");
    const btnConnect = document.getElementById("btn-connect");
    const btnPending = document.getElementById("btn-pending");
    const btnApply = document.getElementById("btn-apply");
    const btnReject = document.getElementById("btn-reject");
    const btnDisconnect = document.getElementById("btn-disconnect");
    const btnMessage = document.getElementById("btn-message");

    let targetUid = new URLSearchParams(window.location.search).get('uid');

    const hideAllButtons = () => {
        if(btnConnect) btnConnect.style.display = "none";
        if(btnPending) btnPending.style.display = "none";
        if(btnApply) btnApply.style.display = "none";
        if(btnReject) btnReject.style.display = "none";
        if(btnDisconnect) btnDisconnect.style.display = "none";
    };

    onAuthStateChanged(auth, (user) => {
        if (!user) return;

        const profileUid = targetUid ? targetUid : user.uid;

        const connectionsRef = collection(db, "connections");
        const qCount = query(connectionsRef, where("participants", "array-contains", profileUid), where("status", "==", "connected"));
        
        onSnapshot(qCount, (snapshot) => {
            const count = snapshot.size;
            if (connectionCountEl) {
                connectionCountEl.textContent = `${count} connection${count !== 1 ? 's' : ''}`;
            }
        });

        if (user.uid === profileUid) {
            hideAllButtons();
            if(btnMessage) btnMessage.style.display = "none";
            return;
        }

        const connectionId = user.uid < profileUid ? `${user.uid}_${profileUid}` : `${profileUid}_${user.uid}`;
        const connectionDocRef = doc(db, "connections", connectionId);

        onSnapshot(connectionDocRef, (docSnap) => {
            hideAllButtons(); 

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                if (data.status === "pending") {
                    if (data.senderId === user.uid) {
                        if(btnPending) btnPending.style.display = "block";
                    } else {
                        if(btnApply) btnApply.style.display = "block";
                        if(btnReject) btnReject.style.display = "block";
                    }
                } else if (data.status === "connected") {
                    if(btnDisconnect) btnDisconnect.style.display = "block";
                }
            } else {
                if(btnConnect) btnConnect.style.display = "block";
            }
        });

        if(btnConnect) {
            btnConnect.addEventListener("click", async () => {
                try {
                    await setDoc(connectionDocRef, {
                        participants: [user.uid, profileUid],
                        senderId: user.uid,
                        receiverId: profileUid,
                        status: "pending",
                        timestamp: serverTimestamp()
                    });

                    const notificationsRef = collection(db, "notifications");
                    await addDoc(notificationsRef, {
                        receiverId: profileUid, 
                        senderId: user.uid,     
                        type: "connection_request",
                        message: "Mengirimkan permintaan koneksi.", 
                        isRead: false,
                        createdAt: serverTimestamp()
                    });
                    
                } catch (error) {
                    console.error("Gagal mengirim permintaan koneksi:", error);
                }
            });
        }

        if(btnApply) {
            btnApply.addEventListener("click", async () => {
                try {
                    await updateDoc(connectionDocRef, {
                        status: "connected",
                        connectedAt: serverTimestamp()
                    });

                    const notificationsRef = collection(db, "notifications");
                    await addDoc(notificationsRef, {
                        receiverId: profileUid, 
                        senderId: user.uid,    
                        type: "connection_accepted",
                        message: "Menerima permintaan koneksi kamu.", 
                        isRead: false,
                        createdAt: serverTimestamp()
                    });
                } catch (error) {
                    console.error("Gagal menerima koneksi:", error);
                }
            });
        }

        if(btnReject) {
            btnReject.addEventListener("click", async () => {
                try {
                    await deleteDoc(connectionDocRef); 
                } catch (error) {
                    console.error("Gagal menolak koneksi:", error);
                }
            });
        }

        if(btnDisconnect) {
            btnDisconnect.addEventListener("click", async () => {
                const confirmDisconnect = confirm("Are you sure you want to remove this connection?");
                if(confirmDisconnect) {
                    try {
                        await deleteDoc(connectionDocRef);
                    } catch (error) {
                        console.error("Gagal menghapus koneksi:", error);
                    }
                }
            });
        }
    });
});