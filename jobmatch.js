const BACKEND_URL = "https://humility.pythonanywhere.com"; // Ganti ke URL PythonAnywhere jika sudah di-hosting

document.addEventListener("DOMContentLoaded", function () {
    const jobsContainer = document.getElementById("jobsContainer");
    const showMoreContainer = document.getElementById("showMoreContainer");
    const showMoreBtn = document.getElementById("showMoreBtn");

    let visibleCount = 6;
    let fetchedJobsData = []; 

    const activeCV = localStorage.getItem("latestUploadedCvName");
    const searchKeyword = localStorage.getItem("jobSearchKeyword") || "Data";
    if (!activeCV) {
        jobsContainer.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 40px; color: #666; font-size:16px;">Silakan unggah atau buat CV Anda di menu <a href="cvbuilder.html" style="color:#4f7c2d; font-weight:bold;">CV Builder</a> terlebih dahulu agar sistem bisa mencarikan pekerjaan untuk Anda.</div>`;
        return; 
    }

    jobsContainer.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 40px; color: #4f7c2d; font-size:18px;"><i class="fa-solid fa-spinner fa-spin"></i> Sedang mencocokkan CV Anda dengan lowongan <b>${searchKeyword}</b> di Jobstreet...</div>`;

    fetch(`${BACKEND_URL}/cari-lowongan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchKeyword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            fetchedJobsData = data.jobs;
            
            if (fetchedJobsData.length === 0) {
                jobsContainer.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 40px; color: #666; font-size:16px;">Tidak ada lowongan yang ditemukan untuk keahlian "${searchKeyword}" saat ini.</div>`;
                return;
            }

            renderJobs();
        } else {
            jobsContainer.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 40px; color: red;">Gagal mengambil lowongan pekerjaan. Pastikan API Key Jobstreet RapidAPI Anda sudah benar.</div>`;
        }
    })
    .catch(error => {
        console.error("Error fetching jobs:", error);
        jobsContainer.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 40px; color: red;">Koneksi ke server terputus. Pastikan server Flask berjalan (python cvbuilder.py).</div>`;
    });

    // 4. Fungsi Render Kartu Pekerjaan
    function renderJobs() {
        jobsContainer.innerHTML = "";
        const jobsToShow = fetchedJobsData.slice(0, visibleCount);

        jobsToShow.forEach(job => {
            const tagsHTML = job.tags.map(tag => `<span style="background: #f3f4f2; color: #555; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;">${tag}</span>`).join("");
            const card = document.createElement("div");
            card.className = "job-card";
            card.style = "background: white; border-radius: 24px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);";
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div style="width: 44px; height: 44px; background: ${job.bgIcon}; color: ${job.colorIcon}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;"><i class="fa-solid ${job.icon}"></i></div>
                    <div style="text-align: right;">
                        <h3 style="font-size: 22px; color: #4f7c2d; margin: 0;">${job.match}</h3>
                        <span style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Match</span>
                    </div>
                </div>
                <h3 style="font-size: 18px; margin: 0 0 4px 0;">${job.title}</h3>
                <p style="color: #888; font-size: 13px; margin: 0 0 16px 0;">${job.company}</p>
                <div class="tags" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                    ${tagsHTML}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                    <div>
                        <p style="margin: 0; font-size: 10px; color: #888;">Salary Range</p>
                        <h4 style="margin: 2px 0 0 0; font-size: 14px; color: #222;">${job.salary}</h4>
                    </div>
                    <button class="apply-btn" onclick="applyForJob(this)" style="background: #4f7c2d; color: white; border: none; border-radius: 12px; padding: 12px 20px; font-weight: 600; cursor: pointer; transition: 0.3s;">Apply Now</button>
                </div>
            `;
            jobsContainer.appendChild(card);
        });

        if (fetchedJobsData.length > visibleCount) {
            showMoreContainer.style.display = "block";
        } else {
            showMoreContainer.style.display = "none";
        }
    }

    showMoreBtn.addEventListener("click", function() {
        visibleCount = fetchedJobsData.length; 
        renderJobs();
    });
});

function applyForJob(buttonElement) {
    buttonElement.innerHTML = '<i class="fa-solid fa-check"></i> Applied';
    buttonElement.style.background = "#dcecc9";
    buttonElement.style.color = "#4f7c2d"; 
    buttonElement.style.cursor = "default"; 
    buttonElement.disabled = true;      
}