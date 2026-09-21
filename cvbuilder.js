import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const BACKEND_URL = "https://humility.pythonanywhere.com";

document.addEventListener("DOMContentLoaded", function () {
    const cvUploadInput = document.getElementById('cvUploadInput');
    const cvFileName = document.getElementById('cvFileName');
    const experienceList = document.getElementById('experienceList');
    const addExperienceBtn = document.getElementById('addExperienceBtn');

    let firestoreSkills = [];
    let currentUserUid = "guest";

    const savedScore = localStorage.getItem("aiScore") || "0";
    const savedFeedback = localStorage.getItem("aiFeedback") || "Silakan unggah CV Anda untuk dianalisis oleh AI.";
    
    document.querySelector('.score-circle h2').textContent = savedScore + "%";
    document.querySelector('.score-circle span').textContent = savedScore >= 85 ? "Strong" : "Good";
    document.querySelector('.coach-message').innerHTML = savedFeedback;

    if(localStorage.getItem("latestUploadedCvName")) {
        if(cvFileName) {
            cvFileName.textContent = "✅ File aktif: " + localStorage.getItem("latestUploadedCvName");
            cvFileName.style.display = "block";
            cvFileName.style.color = "#2f6b10";
        }
    }

    const skillTagsContainer = document.getElementById('skillTags');

    onAuthStateChanged(auth, (user) => {
        if (!user) return;
        currentUserUid = user.uid;

        const userDocRef = doc(db, "users", user.uid);
        onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                firestoreSkills = userData.skills || [];

                if (skillTagsContainer) {
                    skillTagsContainer.innerHTML = "";
                    if (firestoreSkills.length === 0) {
                        skillTagsContainer.innerHTML = '<p style="color: #888; font-size: 13px; margin: 0;">Belum ada skill aktif. Tambahkan melalui halaman Profile.</p>';
                    } else {
                        firestoreSkills.forEach((skill) => {
                            const span = document.createElement('span');
                            span.className = 'skill-tag';
                            span.textContent = skill;
                            span.style.cursor = "default";
                            skillTagsContainer.appendChild(span);
                        });
                    }
                }
            }
        });
    });

    const educationFormList = document.getElementById('educationFormList');

    function renderEducationFormItem(degree = "", university = "") {
        if (!educationFormList) return;
        const eduRow = document.createElement('div');
        eduRow.className = 'education-form-item';
        eduRow.style.marginBottom = "15px";
        eduRow.style.paddingBottom = "10px";
        eduRow.style.borderBottom = "1px dotted #e0e0e0";

        eduRow.innerHTML = `
            <div class="form-row" style="display: flex; gap: 15px;">
                <div class="field" style="flex: 1;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #444;">Degree</label>
                    <input type="text" class="edu-degree-input" value="${degree}" placeholder="Contoh: Bachelor of Science" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                </div>
                <div class="field" style="flex: 1;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #444;">University</label>
                    <input type="text" class="edu-univ-input" value="${university}" placeholder="Contoh: Universitas Indonesia" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                </div>
            </div>
        `;
        eduRow.querySelectorAll('input').forEach(input => input.addEventListener('input', simpanEducationFromCvBuilder));
        educationFormList.appendChild(eduRow);
    }

    function simpanEducationFromCvBuilder() {
        const rows = document.querySelectorAll('.education-form-item');
        const eduArray = [];
        rows.forEach(row => {
            const degree = row.querySelector('.edu-degree-input')?.value || "";
            const school = row.querySelector('.edu-univ-input')?.value || "";
            if (degree || school) eduArray.push({ degree, school });
        });
        localStorage.setItem("careeroEducation", JSON.stringify(eduArray));
    }

    const storedEdu = JSON.parse(localStorage.getItem("careeroEducation")) || [];
    if (storedEdu.length > 0) {
        storedEdu.forEach(edu => renderEducationFormItem(edu.degree, edu.school));
    } else {
        renderEducationFormItem("", "");
        renderEducationFormItem("", "");
    }

    function simpanDataExperienceKeDatabase() {
        const items = document.querySelectorAll('.experience-item');
        const dataArray = [];
        items.forEach(item => {
            const jobTitle = item.querySelector('.job-title-input')?.value || "";
            const company = item.querySelector('.company-input')?.value || "";
            const description = item.querySelector('.description-textarea')?.value || "";
            if(jobTitle || company || description) dataArray.push({ jobTitle, company, description });
        });
        localStorage.setItem("careeroExperience", JSON.stringify(dataArray));
    }

    function renderExperienceItem(jobTitle = "", company = "", description = "") {
        if (!experienceList) return;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'experience-item';
        itemDiv.style.borderTop = "1px dashed #cfcfcf";
        itemDiv.style.marginTop = "20px";
        itemDiv.style.paddingTop = "15px";

        itemDiv.innerHTML = `
            <div class="form-row" style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div class="field" style="flex: 1;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #444;">Job Title</label>
                    <input type="text" class="job-title-input" value="${jobTitle}" placeholder="Contoh: Product Designer" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                </div>
                <div class="field" style="flex: 1;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #444;">Company</label>
                    <input type="text" class="company-input" value="${company}" placeholder="Contoh: PT Maju Jaya" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                </div>
            </div>
            <div class="field">
                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #444;">Description</label>
                <textarea rows="4" class="description-textarea" placeholder="Jelaskan tanggung jawab Anda..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; resize: none;">${description}</textarea>
            </div>
            <button type="button" class="delete-experience-btn" style="color: #ff4d4d; background: transparent; border: none; margin-top: 10px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 13px;">
                <i class="fa-solid fa-trash"></i> Hapus Baris Ini
            </button>
        `;

        itemDiv.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', simpanDataExperienceKeDatabase));
        itemDiv.querySelector('.delete-experience-btn').addEventListener('click', function() {
            itemDiv.remove();
            simpanDataExperienceKeDatabase();
            if (experienceList.children.length === 0) renderExperienceItem();
        });

        experienceList.appendChild(itemDiv);
    }

    const dbExperience = JSON.parse(localStorage.getItem("careeroExperience")) || [];
    if (dbExperience.length > 0) {
        dbExperience.forEach(data => renderExperienceItem(data.jobTitle, data.company, data.description));
    } else {
        renderExperienceItem(); 
    }

    if(cvUploadInput) {
        cvUploadInput.addEventListener('change', function() {
            if(cvUploadInput.files.length > 0) {
                const fileTarget = cvUploadInput.files[0];
                const formData = new FormData();
                formData.append('file', fileTarget);

                if(cvFileName) {
                    cvFileName.textContent = "⏳ AI sedang menganalisis dokumen...";
                    cvFileName.style.display = "block";
                    cvFileName.style.color = "#888";
                }

                fetch(`${BACKEND_URL}/upload-cv`, {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    if(data.filename) {
                        localStorage.setItem("latestUploadedCvName", data.filename);
                        localStorage.setItem("aiScore", data.ai_score);
                        localStorage.setItem("aiFeedback", data.ai_feedback);

                        localStorage.setItem("jobSearchKeyword", "Data Scientist");

                        if(cvFileName) {
                            cvFileName.textContent = "✅ File aktif: " + data.filename;
                            cvFileName.style.color = "#2f6b10";
                        }

                        document.querySelector('.score-circle h2').textContent = data.ai_score + "%";
                        document.querySelector('.score-circle span').textContent = data.ai_score >= 85 ? "Strong" : "Good";
                        document.querySelector('.coach-message').innerHTML = data.ai_feedback;
                    } else if (data.error) {
                        throw new Error(data.error);
                    }
                })
                .catch(err => {
                    console.error("Gagal unggah:", err);
                    if(cvFileName) {
                        cvFileName.textContent = "❌ Gagal terhubung ke Server AI.";
                        cvFileName.style.color = "red";
                    }
                })
                .finally(() => {
                    cvUploadInput.value = ""; 
                });
            }
        });
    }

    const fixSuggestionsBtn = document.getElementById('fixSuggestionsBtn');
    if (fixSuggestionsBtn) {
        fixSuggestionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const latestFile = localStorage.getItem("latestUploadedCvName");
            
            if (!latestFile) {
                alert("Silakan unggah file CV Anda terlebih dahulu!");
                return;
            }

            fixSuggestionsBtn.textContent = "AI Gemini sedang bekerja";
            fixSuggestionsBtn.disabled = true;

            const formData = new FormData();
            formData.append('filename', latestFile);

            fetch(`${BACKEND_URL}/fix-cv`, {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    alert(data.pesan);
                    
                    localStorage.setItem("latestUploadedCvName", data.filename);
                    if(cvFileName) {
                        cvFileName.textContent = "✅ File aktif: " + data.filename;
                    }

                    localStorage.setItem("aiScore", data.new_score);
                    localStorage.setItem("aiFeedback", data.new_feedback);

                    const targetKeyword = data.search_keyword || "Data Scientist";
                    localStorage.setItem("jobSearchKeyword", targetKeyword);

                    document.querySelector('.score-circle h2').textContent = data.new_score + "%";
                    document.querySelector('.score-circle span').textContent = data.new_score >= 85 ? "Strong" : "Good";
                    document.querySelector('.coach-message').innerHTML = data.new_feedback;
                    
                } else {
                    alert("AI gagal memproses dokumen.");
                }
            })
            .catch(err => {
                console.error(err);
                alert("Gagal terhubung ke Server AI.");
            })
            .finally(() => {
                fixSuggestionsBtn.textContent = "Fix All Suggestions";
                fixSuggestionsBtn.disabled = false;
            });
        });
    }

    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const experienceItems = [];
            document.querySelectorAll('.experience-item').forEach(item => {
                const jobTitle = item.querySelector('.job-title-input')?.value || "";
                const company = item.querySelector('.company-input')?.value || "";
                const description = item.querySelector('.description-textarea')?.value || "";
                if(jobTitle || company || description) experienceItems.push({ jobTitle, company, description });
            });

            const educationItems = [];
            document.querySelectorAll('.education-form-item').forEach(row => {
                const d = row.querySelector('.edu-degree-input')?.value || "";
                const u = row.querySelector('.edu-univ-input')?.value || "";
                if(d || u) educationItems.push({ degree: d, university: u }); 
            });

            if (experienceItems.length === 0 && firestoreSkills.length === 0 && educationItems.length === 0) {
                alert("Isi data CV Anda terlebih dahulu!");
                return;
            }

            addExperienceBtn.textContent = "⏳ Menyusun PDF...";
            addExperienceBtn.disabled = true;

            let usernameActive = "DATA PELAMAR";
            try {
                const userData = JSON.parse(localStorage.getItem("careeroUser"));
                if (userData && userData.name) usernameActive = userData.name;
            } catch (err) {}

            fetch(`${BACKEND_URL}/generate-cv-dari-form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: usernameActive,
                    experience: experienceItems,
                    skills: firestoreSkills,
                    education: educationItems
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.filename) {
                    alert("Berhasil! PDF CV Baru Anda telah dibuat.");
                    localStorage.setItem("latestUploadedCvName", data.filename);
                    
                    if (cvFileName) {
                        cvFileName.textContent = "✅ File aktif: " + data.filename;
                        cvFileName.style.display = "block";
                        cvFileName.style.color = "#2f6b10";
                    }
                    
                    localStorage.setItem("aiScore", data.ai_score);
                    localStorage.setItem("aiFeedback", data.ai_feedback);

                    const targetKeyword = data.search_keyword || "Data Scientist";
                    localStorage.setItem("jobSearchKeyword", targetKeyword);

                    document.querySelector('.score-circle h2').textContent = data.ai_score + "%";
                    document.querySelector('.score-circle span').textContent = "Good";
                    document.querySelector('.coach-message').innerHTML = data.ai_feedback;
                }
            })
            .catch(err => {
                console.error(err);
                alert("Gagal mencetak dokumen PDF di server.");
            })
            .finally(() => {
                addExperienceBtn.innerHTML = "+ Add Entry";
                addExperienceBtn.disabled = false;
            });
        });
    }

    const previewCvBtn = document.getElementById('previewCvBtn');
    const downloadCvBtn = document.getElementById('downloadCvBtn');

    if(previewCvBtn) {
        previewCvBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const filename = localStorage.getItem("latestUploadedCvName");
            if(!filename) {
                alert("Belum ada file CV aktif. Silakan unggah terlebih dahulu!");
                return;
            }
            window.open(`${BACKEND_URL}/get-latest-cv/${filename}?mode=preview`, '_blank');
        });
    }

    if(downloadCvBtn) {
        downloadCvBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const filename = localStorage.getItem("latestUploadedCvName");
            if(!filename) {
                alert("Belum ada file CV aktif. Silakan unggah terlebih dahulu!");
                return;
            }
            window.location.href = `${BACKEND_URL}/get-latest-cv/${filename}?mode=download`;
        });
    }
});