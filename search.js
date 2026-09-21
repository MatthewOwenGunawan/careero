import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqzBgcZT_fXpFBbV76Vvkjpdt8M2q4C60",
    authDomain: "careero-login.firebaseapp.com",
    projectId: "careero-login",
    storageBucket: "careero-login.firebasestorage.app",
    messagingSenderId: "1034591118862",
    appId: "1:1034591118862:web:40f6b99c07a64420c4fe5f",
    measurementId: "G-M0M6W3HXNN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {

    const searchInput = document.getElementById("userSearchInput");
    const suggestBox = document.getElementById("userSuggestBox");

    if (!searchInput || !suggestBox) return;

    let allUsers = [];

    try {

        const snapshot = await getDocs(
            collection(db, "users")
        );

        snapshot.forEach((docSnap) => {

            allUsers.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });

        console.log("Loaded Users:", allUsers);

    } catch (err) {

        console.error("Error loading users:", err);

    }

    searchInput.addEventListener("input", () => {

        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();

        if (keyword.length < 2) {

            suggestBox.classList.add("hidden");
            suggestBox.innerHTML = "";
            return;

        }

        const results = allUsers.filter(user => {

            const name =
                (user.name || "")
                .toLowerCase();

            const email =
                (user.email || "")
                .toLowerCase();

            return (
                name.includes(keyword) ||
                email.includes(keyword)
            );

        });

        suggestBox.innerHTML = "";

        if (results.length === 0) {

            suggestBox.innerHTML = `
                <div class="suggest-item">
                    User tidak ditemukan
                </div>
            `;

            suggestBox.classList.remove("hidden");
            return;
        }

        results
            .slice(0, 10)
            .forEach(user => {

                const div =
                    document.createElement("div");

                div.className =
                    "suggest-item";

                div.innerHTML = `
                    <img
                        src="${user.photo || 'https://i.pravatar.cc/150'}"
                        alt="Profile"
                        style="
                            width:40px;
                            height:40px;
                            border-radius:50%;
                            object-fit:cover;
                        "
                    >

                    <div style="
                        display:flex;
                        flex-direction:column;
                    ">
                        <span style="
                            font-weight:600;
                        ">
                            ${user.name || "Unknown User"}
                        </span>

                        <span style="
                            font-size:12px;
                            color:#777;
                        ">
                            ${user.email || ""}
                        </span>
                    </div>
                `;

                div.addEventListener("click", () => {

                    window.location.href =
                        `public_profile.html?uid=${user.id}`;

                });

                suggestBox.appendChild(div);

            });

        suggestBox.classList.remove("hidden");

    });

    document.addEventListener("click", (e) => {

        if (
            !suggestBox.contains(e.target) &&
            e.target !== searchInput
        ) {

            suggestBox.classList.add("hidden");

        }

    });

});