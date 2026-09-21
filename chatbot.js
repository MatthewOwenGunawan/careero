const API_KEY = "Secret";
const MODEL = "gemini-2.5-flash";

const BOT_AVATAR = "asset/lucky boy.png";

const currentUser = JSON.parse(
  localStorage.getItem("careeroUser")
);

const USER_NAME =
  currentUser?.name ||
  currentUser?.displayName ||
  currentUser?.login ||
  "teman";

const chatMessages =
  document.getElementById("chatMessages");

const chatInput =
  document.getElementById("chatInput");

const sendBtn =
  document.getElementById("sendBtn");

const chatHistory = [];

function formatAI(text) {

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n/g, "<br>");
}

function createAvatar(sender) {

  if (sender === "bot") {
    return `
      <img
        class="chat-avatar bot-avatar-img"
        src="${BOT_AVATAR}"
        alt="Lucky Boy"
      />
    `;
  }

  return `
    <img
      class="chat-avatar"
      src="${
        currentUser?.photo ||
        "https://i.pravatar.cc/100"
      }"
      alt="User"
    />
  `;
}

function addMessage(text, sender) {

  const wrapper =
    document.createElement("div");

  wrapper.classList.add(
    "message-wrapper",
    sender
  );

  const avatar =
    createAvatar(sender);

  if (sender === "user") {

    wrapper.innerHTML = `
      <div class="message user">
        ${text}
      </div>
      ${avatar}
    `;
  }

  else {

    wrapper.innerHTML = `
      ${avatar}
      <div class="message bot">
        ${text}
      </div>
    `;
  }

  chatMessages.appendChild(wrapper);

  chatMessages.scrollTop =
    chatMessages.scrollHeight;
}

async function typeMessage(text) {

  const wrapper =
    document.createElement("div");

  wrapper.classList.add(
    "message-wrapper",
    "bot"
  );

  wrapper.innerHTML = `
    ${createAvatar("bot")}
    <div class="message bot"></div>
  `;

  const message =
    wrapper.querySelector(".message");

  chatMessages.appendChild(wrapper);

  let currentText = "";

  for (const char of text) {

    currentText += char;

    message.innerHTML =
      formatAI(currentText);

    chatMessages.scrollTop =
      chatMessages.scrollHeight;

    await new Promise(resolve =>
      setTimeout(resolve, 8)
    );
  }
}

function addLoading() {

  const loading =
    document.createElement("div");

  loading.classList.add(
    "message-wrapper",
    "bot"
  );

  loading.id = "loadingMessage";

  loading.innerHTML = `
    ${createAvatar("bot")}
    <div class="message bot">
      ✨ Lucky lagi mikir bentar...
    </div>
  `;

  chatMessages.appendChild(loading);

  chatMessages.scrollTop =
    chatMessages.scrollHeight;
}

function removeLoading() {

  const loading =
    document.getElementById(
      "loadingMessage"
    );

  if (loading) {
    loading.remove();
  }
}

async function askGemini(userMessage) {

  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  if (chatHistory.length > 30) {
    chatHistory.splice(0, 2);
  }

  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          systemInstruction: {
            parts: [{
              text: `
Nama user kamu adalah: ${USER_NAME}
Panggil user dengan nama itu kalau cocok dalam percakapan.

Kamu adalah "Lucky Boy", teman ngobrol user yang santai, sedikit jahil, dan enak diajak ngobrol.

Tujuan kamu:
Membuat percakapan terasa seperti ngobrol sama teman, bukan chatbot.

🎭 CARA BERBICARA:
- Santai dan natural
- Singkat tapi nyambung
- Kadang pakai humor ringan
- Kadang pakai emoji seperlunya

📌 GAYA:
1. User serius → jawab jelas tapi santai
2. User santai → ikut santai
3. User bercanda → ikut humor
4. User curhat → empatik

😂 ATURAN:
- Jangan jadi chatbot formal
- Jangan bilang AI
- Tetap Lucky Boy

🔥 PRINSIP:
Obrolan harus terasa hidup seperti manusia.
              `
            }]
          },

          contents: chatHistory,

          generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 800
          }

        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return "❌ Error API: " +
        (data.error?.message || "Unknown Error");
    }

    const reply =
      data?.candidates?.[0]
        ?.content?.parts?.[0]?.text;

    if (!reply) {
      return "Lucky lagi blank 😭";
    }

    chatHistory.push({
      role: "model",
      parts: [{ text: reply }]
    });

    return reply;

  } catch (error) {
    return "❌ Koneksi bermasalah 😭 " + error.message;
  }
}

async function sendMessage() {

  const message =
    chatInput.value.trim();

  if (!message) return;

  addMessage(message, "user");

  chatInput.value = "";

  addLoading();

  const aiReply =
    await askGemini(message);

  removeLoading();

  await typeMessage(aiReply);
}

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

document
  .querySelectorAll(".suggestion-btn")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      chatInput.value = btn.innerText;
      sendMessage();
    });
  });

window.addEventListener("load", () => {

  addMessage(
    `
<strong>Halo ${USER_NAME}! 👋</strong><br><br>

Aku <strong>Lucky Boy</strong> 😊<br><br>

Aku bisa bantu kamu untuk:

<ul>
<li>🎓 Memilih jurusan</li>
<li>🗺️ Membuat roadmap belajar</li>
<li>💼 Menentukan karier</li>
<li>📄 Review CV</li>
<li>🎤 Interview</li>
<li>🚀 Skill development</li>
<li>🤝 Diskusi santai</li>
</ul>

Kalau lagi bingung, cerita aja 😊
    `,
    "bot"
  );
});