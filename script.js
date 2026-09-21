window.editingEduId = null; // Variabel global untuk melacak data mana yang sedang diedit

window.toggleProfileMenu = function() {
    const menu = document.getElementById("profileMenu");
    if (menu) {
        menu.classList.toggle("hidden");
    }
};

window.logout = function() {
    localStorage.clear();
    window.location.href = "index.html";
};

window.closeEduModal = function() {
    const eduModal = document.getElementById('educationModal');
    const addEduForm = document.getElementById('addEduForm');
    if (eduModal) eduModal.classList.add('hidden');
    if (addEduForm) addEduForm.reset();
    window.editingEduId = null; 
};

document.addEventListener("click", (e) => {
    const menu = document.getElementById("profileMenu");
    const btn = document.querySelector(".profile-click");

    if (!menu || !btn) return;

    if (!menu.contains(e.target) && e.target !== btn) {
        menu.classList.add("hidden");
    }
});


document.addEventListener("DOMContentLoaded", async function () {

    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem("careeroUser"));
        } catch {
            return null;
        }
    };

    const saveUser = (u) => {
        if (!u) return;
        localStorage.setItem("careeroUser", JSON.stringify(u));
    };

    const user = getUser();

    function setupToggle(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);

        if (!input || !icon) return;

        icon.addEventListener("click", () => {
            if (input.type === "password") {
                input.type = "text";
                icon.classList.add("fa-eye-slash");
                icon.classList.remove("fa-eye");
            } else {
                input.type = "password";
                icon.classList.add("fa-eye");
                icon.classList.remove("fa-eye-slash");
            }
        });
    }

    setupToggle("passwordInput", "togglePassword");
    setupToggle("registerPassword", "togglePassword");

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm.querySelector('input[type="email"]').value;
            const password = document.getElementById("passwordInput")?.value;

            try {
                const res = await fetch("https://humility.pythonanywhere.com/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Login gagal");
                    return;
                }

                saveUser({
                    name: email,
                    email: email,
                    photo: "https://i.pravatar.cc/100"
                });

                window.location.href = "dashboard.html";

            } catch (err) {
                console.error(err);
                alert("Server tidak merespon");
            }
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const fullname = document.getElementById("fullname")?.value;
            const email = document.getElementById("registerEmail")?.value;
            const password = document.getElementById("registerPassword")?.value;

            try {
                const res = await fetch("https://humility.pythonanywhere.com/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fullname, email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Register gagal");
                    return;
                }

                alert("Akun berhasil dibuat");
                window.location.href = "index.html";

            } catch (err) {
                console.error(err);
                alert("Server tidak merespon");
            }
        });
    }

    if (user) {
        const welcome = document.getElementById("welcomeText");
        const photo = document.getElementById("userPhoto");

        if (welcome) welcome.textContent = `Welcome back, ${user.name} 👋`;
        if (photo) photo.src = user.photo;
    }

    if (user) {
        const nameEl = document.getElementById("profileName");
        const emailEl = document.getElementById("profileEmail");
        const photoEl = document.getElementById("profilePhoto");
        const navPhoto = document.getElementById("navPhoto");

        if (nameEl) nameEl.textContent = user.name;
        if (emailEl) emailEl.textContent = user.email;
        if (photoEl) photoEl.src = user.photo;
        if (navPhoto) navPhoto.src = user.photo;
    }

    const eduModal = document.getElementById('educationModal');
    const addEducationBtn = document.getElementById('addEducationBtn');
    const addEduForm = document.getElementById('addEduForm');
    const educationList = document.getElementById('educationList');

    const eduInput = document.getElementById("eduModalSchool");
    const eduSuggest = document.getElementById("eduSuggestBox");

    let schoolsData = [];
    let selectedLogo = "";

    // SCHOOL DATA
    const indonesiaSchools = [
        { name: "SMAK PENABUR Gading Serpong", logo: "https://bpkpenabur.or.id/assets/Logo-PENABUR-White.webp" },
        { name: "SMAK PENABUR Kelapa Gading", logo: "https://bpkpenabur.or.id/assets/Logo-PENABUR-White.webp" },
        { name: "SMAK PENABUR Harapan Indah", logo: "https://bpkpenabur.or.id/assets/Logo-PENABUR-White.webp" },
        { name: "BINUS SCHOOL Serpong", logo: "https://binus.sch.id/wp-content/themes/binus-2022-285-school/images/contact/logo-serpong.png" },
        { name: "BINUS SCHOOL Simprug", logo: "https://binus.sch.id/wp-content/themes/binus-2022-285-school/images/contact/logo-simprug.png" },
        { name: "BINUS SCHOOL Bekasi", logo: "https://binus.sch.id/wp-content/themes/binus-2022-285-school/images/contact/logo-bekasi.png" },
        { name: "SMA Negeri 8 Jakarta", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/b/b2/Logo_SMAN_8_Jakarta.jpg/250px-Logo_SMAN_8_Jakarta.jpg" },
        { name: "SMA Negeri 70 Jakarta", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/b/b2/Logo_SMAN_8_Jakarta.jpg/250px-Logo_SMAN_8_Jakarta.jpg" },
        { name: "SMA Negeri 3 Bandung", logo: "https://ui-avatars.com/api/?name=SMAN+3+Bandung" },
        { name: "SMA Taruna Nusantara", logo: "https://ui-avatars.com/api/?name=Taruna+Nusantara" },
        { name: "SMA Labschool Kebayoran", logo: "https://ui-avatars.com/api/?name=Labschool" },
        { name: "SMA Santa Ursula Jakarta", logo: "https://ui-avatars.com/api/?name=Santa+Ursula" },
        { name: "SMA Kanisius Jakarta", logo: "https://ui-avatars.com/api/?name=Kanisius" },
        { name: "SMA Kolese Gonzaga", logo: "https://ui-avatars.com/api/?name=Gonzaga" },
        { name: "SMA Al Azhar 1 Jakarta", logo: "https://ui-avatars.com/api/?name=Al+Azhar" },
        { name: "SMA St Bellarminus Jakarta", logo: "https://bellarminus.sch.id/wp-content/uploads/2024/12/LOGO-BELAR-BARU1.png" },
        { name: "Jakarta Intercultural School", logo: "https://ui-avatars.com/api/?name=JIS" },
        { name: "British School Jakarta", logo: "https://ui-avatars.com/api/?name=BSJ" },
        { name: "Global Jaya School", logo: "https://ui-avatars.com/api/?name=Global+Jaya" },
        { name: "ACS Jakarta", logo: "https://ui-avatars.com/api/?name=ACS" },
        { name: "SMK Telkom Malang", logo: "https://upload.wikimedia.org/wikipedia/id/8/87/Logo_SMK_Telkom_Malang.png" },
        { name: "SMK Wikrama Bogor", logo: "https://ui-avatars.com/api/?name=Wikrama" },
        { name: "SMK RPL IDN Boarding School", logo: "https://ui-avatars.com/api/?name=IDN" }
    ];

    async function loadUniversities() {
        try {
            const res = await fetch("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
            const data = await res.json();
            const universityData = data.map(u => ({
                name: u.name,
                logo: u.domains?.[0]
                    ? `https://www.google.com/s2/favicons?domain=${u.domains[0]}&sz=128`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`
            }));

            schoolsData = [...indonesiaSchools, ...universityData];
            console.log("Loaded:", schoolsData.length);
        } catch (err) {
            console.error("University fetch gagal:", err);
            schoolsData = indonesiaSchools;
        }
    }

    await loadUniversities();

    if (addEducationBtn) {
        addEducationBtn.addEventListener('click', () => {
            if (addEduForm) addEduForm.reset();
            window.editingEduId = null; 
            document.querySelector("#educationModal h2").textContent = "Add education"; // Update judul modal
            eduModal.classList.remove('hidden');
        });
    }

    if (eduInput && eduSuggest) {
        eduInput.addEventListener("input", () => {
            const val = eduInput.value.toLowerCase().trim();
            eduSuggest.innerHTML = "";

            if (val.length < 2) {
                eduSuggest.classList.add("hidden");
                return;
            }

            const result = schoolsData.filter(item => item.name.toLowerCase().includes(val)).slice(0, 6);

            if (!result.length) {
                eduSuggest.classList.add("hidden");
                return;
            }

            result.forEach(item => {
                const div = document.createElement("div");
                div.className = "suggest-item";
                div.innerHTML = `
                    <img src="${item.logo}" alt="logo" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}'" style="width:38px;height:38px;border-radius:10px;object-fit:cover;border:1px solid #e5e7eb;background:white;">
                    <span>${item.name}</span>
                `;
                div.onclick = () => {
                    eduInput.value = item.name;
                    selectedLogo = item.logo;
                    eduSuggest.classList.add("hidden");
                };
                eduSuggest.appendChild(div);
            });
            eduSuggest.classList.remove("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!eduSuggest.contains(e.target) && e.target !== eduInput) {
                eduSuggest.classList.add("hidden");
            }
        });
    }

    function renderEducation() {
        const storedEdu = JSON.parse(localStorage.getItem("careeroEducation")) || [];

        storedEdu.sort((a, b) => {
            const getStartYear = (text) => {
                if (!text) return 0;
                const match = text.match(/\d{4}/);
                return match ? Number(match[0]) : 0;
            };
            return getStartYear(b.yearText) - getStartYear(a.yearText);
        });

        if (!educationList) return; 

        educationList.innerHTML = "";

        if (!storedEdu.length) {
            educationList.innerHTML = `<p style="text-align:center; color:#888; padding:20px;">Belum ada education</p>`;
            return;
        }

        storedEdu.forEach(item => {
            const html = `
                <div class="edu-item" style="display:flex; gap:14px; margin-bottom:20px; align-items:flex-start;">
                    <img src="${item.logo}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(item.school)}'" style="width:56px; height:56px; border-radius:14px; object-fit:cover; border:1px solid #e5e7eb; background:white;">
                    <div style="flex:1">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h4 style="margin:0; font-size:16px; font-weight:600;">${item.school}</h4>
                            <div style="display:flex; gap:12px; align-items:center;">
                                <i class="fa-solid fa-pen edu-edit-btn" data-id="${item.id}" style="color:#555; cursor:pointer; font-size:14px;" title="Edit Education"></i>
                                <i class="fa-solid fa-trash edu-delete-btn" data-id="${item.id}" style="color:#dc3545; cursor:pointer; font-size:14px;" title="Delete Education"></i>
                            </div>
                        </div>
                        <p style="margin:4px 0; color:#4A7C2C; font-size:14px; font-weight:600;">${item.degree}</p>
                        <p style="margin:0; color:#777; font-size:13px;">${item.yearText}</p>
                        <p style="margin-top:8px; color:#555; line-height:1.5; font-size:13px;">${item.desc}</p>
                    </div>
                </div>
            `;
            educationList.insertAdjacentHTML("beforeend", html);
        });
    }


    async function fetchEducationFromFirebase() {
        const checkAuth = setInterval(async () => {
            if (window.auth && window.auth.currentUser && window.db && window.doc && window.getDoc) {
                clearInterval(checkAuth); 
                try {
                    const user = window.auth.currentUser;
                    const userDocRef = window.doc(window.db, "users", user.uid);
                    const docSnap = await window.getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        if (userData.education) {
                            localStorage.setItem("careeroEducation", JSON.stringify(userData.education));
                            renderEducation();
                        }
                    }
                } catch (error) {
                    console.error("Gagal mengambil data education dari Firebase:", error);
                }
            }
        }, 300);
    }

    async function saveEducationToFirebase(educationArray) {
        try {
            if (window.auth && window.auth.currentUser && window.db && window.doc && window.setDoc) {
                const user = window.auth.currentUser;
                const userDocRef = window.doc(window.db, "users", user.uid);
                
                await window.setDoc(userDocRef, { education: educationArray }, { merge: true });
                console.log("Sukses! Education tersimpan ke Firebase.");
            }
        } catch (error) {
            console.error("Gagal menyimpan ke Firebase:", error);
        }
    }


    if (addEduForm) {
        addEduForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const school = document.getElementById("eduModalSchool").value;
            const degree = document.getElementById("eduModalDegree").value;
            const start = document.getElementById("eduModalStart").value;
            const end = document.getElementById("eduModalEnd").value;
            const desc = document.getElementById("eduModalDesc").value;

            const yearText = `${start || "..."} - ${end || "Present"}`;
            const finalLogo = selectedLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(school)}`;

            let current = JSON.parse(localStorage.getItem("careeroEducation")) || [];

            if (window.editingEduId) {
                const index = current.findIndex(item => item.id === window.editingEduId);
                if (index !== -1) {
                    current[index] = {
                        ...current[index],
                        school, 
                        degree, 
                        yearText, 
                        desc,
                        logo: selectedLogo ? finalLogo : current[index].logo
                    };
                }
                window.editingEduId = null;
            } else {
                const newEdu = {
                    id: Date.now(),
                    school,
                    degree,
                    yearText,
                    desc,
                    logo: finalLogo
                };
                current.unshift(newEdu);
            }

            localStorage.setItem("careeroEducation", JSON.stringify(current));
            renderEducation();
            await saveEducationToFirebase(current);

            addEduForm.reset();
            selectedLogo = "";
            eduModal.classList.add("hidden");
        });
    }

    if (educationList) {
        educationList.addEventListener("click", async (e) => {
            // MODIFIKASI: Fitur Delete
            if (e.target.classList.contains("edu-delete-btn")) {
                if(!confirm("Yakin ingin menghapus riwayat pendidikan ini?")) return;

                const id = Number(e.target.dataset.id);
                const current = JSON.parse(localStorage.getItem("careeroEducation")) || [];
                const filtered = current.filter(item => item.id !== id);

                localStorage.setItem("careeroEducation", JSON.stringify(filtered));
                renderEducation();
                await saveEducationToFirebase(filtered);
            }

            if (e.target.classList.contains("edu-edit-btn")) {
                const id = Number(e.target.dataset.id);
                const current = JSON.parse(localStorage.getItem("careeroEducation")) || [];
                const itemToEdit = current.find(item => item.id === id);

                if (itemToEdit) {
                    window.editingEduId = id; 
                    selectedLogo = itemToEdit.logo; 
                    
                    document.getElementById("eduModalSchool").value = itemToEdit.school || "";
                    document.getElementById("eduModalDegree").value = itemToEdit.degree || "";
                    document.getElementById("eduModalDesc").value = itemToEdit.desc || "";

                    let startVal = "", endVal = "";
                    if (itemToEdit.yearText) {
                        const splitYears = itemToEdit.yearText.split(" - ");
                        if (splitYears[0] && splitYears[0] !== "...") startVal = splitYears[0];
                        if (splitYears[1] && splitYears[1] !== "Present") endVal = splitYears[1];
                    }

                    document.getElementById("eduModalStart").value = startVal;
                    document.getElementById("eduModalEnd").value = endVal;

                    // Tampilkan modal dan ubah judulnya
                    document.querySelector("#educationModal h2").textContent = "Edit education";
                    eduModal.classList.remove("hidden");
                }
            }
        });
    }

    if (educationList) {
        renderEducation(); 
        fetchEducationFromFirebase();
    }


    async function setupNotificationListener() {
        if (!window.location.pathname.includes("dashboard.html") && !window.location.href.includes("dashboard.html")) {
            return; 
        }

        try {
            const { initializeApp, getApps, getApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
            const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
            const { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
            
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

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    const notifRef = collection(db, "users", user.uid, "notifications");
                    const q = query(notifRef, where("isRead", "==", false));

                    onSnapshot(q, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                const notifData = change.doc.data();
                                const notifId = change.doc.id;
                                showToastNotification(notifData, user.uid, notifId, updateDoc, doc, db);
                            }
                        });
                    });
                }
            });

        } catch (error) {
            console.error("Gagal setup listener notifikasi:", error);
        }
    }

    function showToastNotification(data, currentUserId, notifId, updateDocFunc, docFunc, dbInstance) {
        if (!window.location.pathname.includes("dashboard.html") && !window.location.href.includes("dashboard.html")) {
            return; 
        }

        if (document.getElementById(`toast-${notifId}`)) return;

        const toast = document.createElement("div");
        toast.id = `toast-${notifId}`;
        toast.className = "careero-toast-notif";
        
        const shortText = data.text && data.text.length > 30 ? data.text.substring(0, 30) + "..." : (data.text || "Pesan baru");

        toast.innerHTML = `
            <img src="${data.senderPhoto || 'https://i.pravatar.cc/150'}" alt="Avatar" class="toast-avatar">
            <div class="toast-content">
                <span class="toast-name">${data.senderName || 'Seseorang'}</span>
                <span class="toast-text">${shortText}</span>
            </div>
        `;

        toast.onclick = async () => {
            try {
                const docToUpdate = docFunc(dbInstance, "users", currentUserId, "notifications", notifId);
                await updateDocFunc(docToUpdate, { isRead: true });

                window.location.href = `public_profile.html?uid=${data.senderId}`;
            } catch (error) {
                console.error("Gagal update status notifikasi:", error);
            }
        };

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.classList.remove("show");
                setTimeout(() => toast.remove(), 300);
            }
        }, 15000);
    }

    setupNotificationListener();

});