// Menu mobile
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Newsletter (Mailchimp)
// ▼▼▼ CONFIG: cole aqui a URL do SEU formulário embutido do Mailchimp ▼▼▼
// No Mailchimp: Audience → Signup forms → Embedded forms. Copie a URL do
// atributo action="..." (algo como https://SEU.usX.list-manage.com/subscribe/post?u=...&id=...&f_id=...)
// e cole abaixo. O código troca "/post" por "/post-json" automaticamente.
// Lembre também de ajustar o "name" do campo honeypot (b_..._...) no index.html.
const MAILCHIMP_ACTION_URL =
  "https://gmail.us13.list-manage.com/subscribe/post?u=d098cc4d96401b655954d4c04&id=f3979fcfb3&f_id=00b77de9f0";
// ▲▲▲ FIM DA CONFIG ▲▲▲

const form = document.getElementById("newsletter-form");
const email = document.getElementById("email");
const msg = document.getElementById("form-msg");

function mailchimpSubscribe(emailValue) {
  return new Promise((resolve, reject) => {
    const callback = "mcjsonp_" + Date.now();
    const base = MAILCHIMP_ACTION_URL.replace("/post?", "/post-json?");
    const url = `${base}&EMAIL=${encodeURIComponent(emailValue)}&c=${callback}`;

    const script = document.createElement("script");
    const cleanup = () => {
      delete window[callback];
      script.remove();
    };
    window[callback] = (data) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("network"));
    };
    script.src = url;
    document.body.appendChild(script);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = email.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (!valid) {
    msg.textContent = "Por favor, insira um e-mail válido.";
    msg.className = "form-msg err";
    return;
  }

  const btn = form.querySelector("button[type=submit]");
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Enviando...";
  msg.textContent = "";
  msg.className = "form-msg";

  try {
    const data = await mailchimpSubscribe(value);
    if (data.result === "success") {
      msg.textContent = "Pronto! Verifique seu e-mail para confirmar a inscrição. 🎉";
      msg.className = "form-msg ok";
      form.reset();
    } else {
      // Mailchimp devolve a mensagem em HTML; removemos as tags.
      const text = (data.msg || "Não foi possível inscrever.").replace(/<[^>]*>/g, "");
      msg.textContent = text;
      msg.className = "form-msg err";
    }
  } catch (err) {
    msg.textContent = "Erro de conexão. Tente novamente em instantes.";
    msg.className = "form-msg err";
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
});

// Reveal on scroll
const revealEls = document.querySelectorAll(".card, .section-head, .newsletter");
revealEls.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));

// Navbar com sombra ao rolar
const navbar = document.querySelector(".navbar");
const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Scroll-spy: destaca o link da seção visível
const navAnchors = [...document.querySelectorAll(".nav-links a:not(.nav-cta)")];
const sections = navAnchors
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spy.observe(s));

// Spotlight seguindo o cursor nos cards
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// Contador animado das estatísticas
const counters = document.querySelectorAll("[data-count]");
const animateCount = (el) => {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  const dur = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
counters.forEach((c) => countObserver.observe(c));

// Modal dos destaques
const TOPICS = {
  multimodal: {
    icon: "🎨",
    title: "IA Generativa Multimodal",
    lead: "Em 2026, os modelos deixaram de tratar texto, imagem, áudio e vídeo como mundos separados. Tudo vive no mesmo espaço de representação, então o modelo entende um gráfico, descreve um vídeo e gera uma trilha sonora com a mesma fluidez com que escreve um texto.",
    points: [
      "Geração cruzada: descreva em palavras e receba imagem, vídeo ou áudio coerentes.",
      "Compreensão visual de documentos, telas, plantas e gráficos complexos.",
      "Assistentes que veem e ouvem em tempo real, conversando sobre o que está na sua câmera.",
    ],
    examples: "Exemplos: Claude, GPT e Gemini em suas versões multimodais.",
  },
  agentes: {
    icon: "🤖",
    title: "Agentes Autônomos",
    lead: "Agentes vão além de responder perguntas: eles planejam, executam e verificam tarefas de várias etapas usando ferramentas reais — navegador, terminal, APIs e arquivos — com supervisão humana mínima.",
    points: [
      "Planejamento em múltiplos passos com correção de rota quando algo falha.",
      "Uso de ferramentas: navegam na web, rodam código e chamam serviços externos.",
      "Equipes de agentes que dividem tarefas e colaboram entre si.",
    ],
    examples: "Exemplos: agentes de programação, automação de pesquisa e assistentes de operações.",
  },
  cognitiva: {
    icon: "🧠",
    title: "Computação Cognitiva",
    lead: "Inspirada na forma como pensamos, a computação cognitiva busca raciocínio mais próximo do humano: memória que persiste entre conversas, inferência causal e a capacidade de explicar o próprio raciocínio.",
    points: [
      "Memória de longo prazo: o sistema lembra de contexto entre sessões.",
      "Raciocínio causal — entende o porquê, não apenas correlações.",
      "Inferência em tempo real com custo cada vez menor.",
    ],
    examples: "Áreas em destaque: memória persistente, raciocínio passo a passo e modelos de mundo.",
  },
};

const modal = document.getElementById("modal");
const modalIcon = document.getElementById("modal-icon");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
let lastFocused = null;

function openModal(topic) {
  const data = TOPICS[topic];
  if (!data) return;
  lastFocused = document.activeElement;
  modalIcon.textContent = data.icon;
  modalTitle.textContent = data.title;
  modalBody.innerHTML = `
    <p>${data.lead}</p>
    <h4>Em destaque</h4>
    <ul>${data.points.map((p) => `<li>${p}</li>`).join("")}</ul>
    <p class="examples">${data.examples}</p>`;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close").focus();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll(".card-link[data-topic]").forEach((btn) =>
  btn.addEventListener("click", () => openModal(btn.dataset.topic))
);
modal.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", closeModal)
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});
