import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc
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

const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

function saveUser(user) {
    localStorage.setItem(
        "careeroUser",
        JSON.stringify(user)
    );
}

document.getElementById("registerForm")?.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const fullname =
            document.getElementById("fullname").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            await updateProfile(user, {
                displayName: fullname
            });

            const defaultAvatar =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=c4e5a5&color=111827&bold=true`;

            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    name: fullname,
                    name_lowercase: fullname.toLowerCase(),
                    email: email,
                    photo: defaultAvatar,
                    createdAt: new Date().toISOString()
                }
            );

            saveUser({
                name: fullname,
                email: email,
                photo: defaultAvatar
            });

            alert("Account created successfully!");

            window.location.href = "dashboard.html";

        } catch (err) {

            console.error(err);

            if (
                err.code === "auth/email-already-in-use"
            ) {

                alert("Email sudah terdaftar!");

            } else if (
                err.code === "auth/weak-password"
            ) {

                alert(
                    "Password terlalu lemah, minimal 6 karakter."
                );

            } else {

                alert(
                    "Gagal mendaftar: " + err.message
                );

            }
        }
    }
);


window.signupGoogle = async function () {

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        const user = result.user;

        const defaultAvatar =
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.displayName || user.email
            )}`;

        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                name:
                    user.displayName ||
                    user.email.split("@")[0],

                name_lowercase:
                    (
                        user.displayName ||
                        user.email.split("@")[0]
                    ).toLowerCase(),

                email: user.email,
                photo: defaultAvatar,
                createdAt: new Date().toISOString()
            }
        );

        saveUser({
            name: user.displayName,
            email: user.email,
            photo: defaultAvatar
        });

        window.location.href = "dashboard.html";

    } catch (err) {

        console.error(err);

        alert("Google signup gagal");
    }
};

window.signupGithub = async function () {

    try {

        const result =
            await signInWithPopup(
                auth,
                githubProvider
            );

        const user = result.user;

        const name =
            user.displayName ||
            user.email ||
            "Github User";

        const avatar =
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                name: name,
                name_lowercase: name.toLowerCase(),
                email:
                    user.email ||
                    "github-user@example.com",
                photo: avatar,
                createdAt: new Date().toISOString()
            }
        );

        saveUser({
            name: name,
            email:
                user.email ||
                "github-user@example.com",
            photo: avatar
        });

        window.location.href = "dashboard.html";

    } catch (err) {

        console.error(err);

        alert("GitHub signup gagal");
    }
};