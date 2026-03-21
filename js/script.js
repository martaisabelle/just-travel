/* ==========================================================================
   Just Travel — Main Script
   Author: Marta Isabelle
   Modules:
     1. Footer year
     2. Active nav link
     3. Hamburger menu (mobile)
     4. Card scroll reveal (IntersectionObserver)
     5. Destination modal
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* -------------------------------------------------------------------------
     1. FOOTER YEAR
     Writes the current year into every #year span across all pages.
  -------------------------------------------------------------------------- */
  document.querySelectorAll("#year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });


  /* -------------------------------------------------------------------------
     2. ACTIVE NAV LINK
     Marks the nav link whose href matches the current page filename
     with aria-current="page" (CSS already styles this state).
  -------------------------------------------------------------------------- */
  (function setActiveNav() {
    var currentFile = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(function (link) {
      var linkFile = link.getAttribute("href").split("/").pop();
      if (linkFile === currentFile) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  })();


  /* -------------------------------------------------------------------------
     3. HAMBURGER MENU (mobile)
     Injects a toggle button before the nav list, toggles .nav--open.
     Only visible below 700px via CSS (nav-toggle display:none on desktop).
  -------------------------------------------------------------------------- */
  (function initHamburger() {
    var nav     = document.querySelector(".site-nav");
    var navList = document.querySelector(".nav-list");
    if (!nav || !navList) return;

    var btn = document.createElement("button");
    btn.className = "nav-toggle";
    btn.setAttribute("aria-label", "Toggle navigation menu");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "nav-list");
    btn.innerHTML =
      "<span class='nav-toggle__bar'></span>" +
      "<span class='nav-toggle__bar'></span>" +
      "<span class='nav-toggle__bar'></span>";

    navList.id = "nav-list";
    nav.insertBefore(btn, navList);

    btn.addEventListener("click", function () {
      var isOpen = navList.classList.toggle("nav--open");
      btn.classList.toggle("nav-toggle--active", isOpen);
      btn.setAttribute("aria-expanded", String(isOpen));
    });

    // Close when a link is tapped on mobile
    navList.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        navList.classList.remove("nav--open");
        btn.classList.remove("nav-toggle--active");
        btn.setAttribute("aria-expanded", "false");
      });
    });

    // Close on click outside the nav
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) {
        navList.classList.remove("nav--open");
        btn.classList.remove("nav-toggle--active");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  })();


  /* -------------------------------------------------------------------------
     4. CARD SCROLL REVEAL
     IntersectionObserver adds .is-visible to .destino-card when it enters
     the viewport. CSS handles the actual fade+slide transition.
     Cards inside the same row get a staggered delay (0 / 80 / 160 ms).
  -------------------------------------------------------------------------- */
  (function initScrollReveal() {
    var cards = document.querySelectorAll(".destino-card");
    if (!cards.length) return;

    cards.forEach(function (card, index) {
      card.style.transitionDelay = (index % 3) * 80 + "ms";
    });

    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -50px 0px" }
    );

    cards.forEach(function (card) { observer.observe(card); });
  })();


  /* -------------------------------------------------------------------------
     5. DESTINATION MODAL
     Click any .destino-card to open a modal with the destination image,
     name and a short description. Data comes from the card's own DOM.
     Fully accessible: focus-trapped, Escape closes, aria attributes set.
  -------------------------------------------------------------------------- */
  (function initModal() {
    var cards = document.querySelectorAll(".destino-card");
    if (!cards.length) return;

    // Short descriptions keyed by figcaption text
    var descriptions = {
      "Japan":          "Discover ancient temples, neon-lit cities, and the magic of cherry blossom season.",
      "Australia":      "From the Great Barrier Reef to the Outback — Australia is unlike anywhere on Earth.",
      "Rio de Janeiro": "Iconic beaches, vibrant carnival culture, and breathtaking mountain scenery.",
      "Switzerland":    "Alpine villages, pristine lakes, and some of the world's most dramatic landscapes.",
      "France":         "The Eiffel Tower, world-class cuisine, and the charm of Parisian boulevards await.",
      "London":         "Royal palaces, world-class museums, and a city that never runs out of things to do.",
      "South Korea":    "Ancient palaces meet K-pop culture in one of Asia's most exciting destinations.",
      "Maldives":       "Overwater bungalows, turquoise lagoons, and the most stunning sunsets on the planet.",
      "Peru":           "Hike the Inca Trail to Machu Picchu and explore an ancient civilization.",
      "California":     "Sun, surf, Hollywood glamour, and the open road — the ultimate West Coast experience."
    };

    // Build modal element (once, reused for every card click)
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "modal-title");
    overlay.setAttribute("tabindex", "-1");
    overlay.innerHTML =
      "<div class='modal'>" +
        "<button class='modal__close' aria-label='Close destination details'>" +
          "<span aria-hidden='true'>&times;</span>" +
        "</button>" +
        "<img class='modal__img' src='' alt=''>" +
        "<div class='modal__body'>" +
          "<h2 class='modal__title' id='modal-title'></h2>" +
          "<p class='modal__desc'></p>" +
          "<a href='#' class='btn btn--primary modal__cta'>Book this destination</a>" +
        "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    var elImg   = overlay.querySelector(".modal__img");
    var elTitle = overlay.querySelector(".modal__title");
    var elDesc  = overlay.querySelector(".modal__desc");
    var elClose = overlay.querySelector(".modal__close");
    var lastFocused;

    function openModal(card) {
      var img     = card.querySelector(".destino-img");
      var caption = card.querySelector(".destino-label");
      var name    = caption ? caption.textContent.trim() : "";

      elImg.src          = img ? img.src : "";
      elImg.alt          = img ? img.alt : "";
      elTitle.textContent = name;
      elDesc.textContent  = descriptions[name] || "An unforgettable destination awaits you.";

      lastFocused = document.activeElement;
      overlay.classList.add("modal-overlay--open");
      document.body.classList.add("modal-open");
      overlay.focus();
    }

    function closeModal() {
      overlay.classList.remove("modal-overlay--open");
      document.body.classList.remove("modal-open");
      if (lastFocused) lastFocused.focus();
    }

    // Make cards keyboard-accessible and clickable
    cards.forEach(function (card) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-haspopup", "dialog");

      card.addEventListener("click", function () { openModal(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    elClose.addEventListener("click", closeModal);

    // Click on backdrop (outside .modal box) closes it
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    // Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("modal-overlay--open")) {
        closeModal();
      }
    });
  })();

  /* -------------------------------------------------------------------------
     6. CONTACT CARD REVEAL
     IntersectionObserver adds .is-visible to .contact-card as it enters
     the viewport. CSS handles the fade + slide transition.
     The second card gets a 100ms stagger via CSS transition-delay.
  -------------------------------------------------------------------------- */
  (function initContactReveal() {
    var cards = document.querySelectorAll(".contact-card");
    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach(function (card) { observer.observe(card); });
  })();


  /* -------------------------------------------------------------------------
     7. LOGIN BUTTON — scale pulse on click for tactile feedback.
     Adds .btn--pulse, waits for animationend, removes it.
     void offsetWidth forces reflow so the animation retriggers on fast clicks.
  -------------------------------------------------------------------------- */
  (function initLoginButton() {
    var btn = document.getElementById("login-btn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      btn.classList.remove("btn--pulse");
      void btn.offsetWidth;
      btn.classList.add("btn--pulse");
    });

    btn.addEventListener("animationend", function () {
      btn.classList.remove("btn--pulse");
    });
  })();


  /* -------------------------------------------------------------------------
     8. HELP CARD REVEAL
     Staggered scroll reveal for the 4 .help-card elements.
     Delay already set via CSS nth-child (0 / 80 / 160 / 240ms).
  -------------------------------------------------------------------------- */
  (function initHelpCardReveal() {
    var cards = document.querySelectorAll(".help-card");
    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach(function (card) { observer.observe(card); });
  })();



  /* -------------------------------------------------------------------------
     10. CHAT ONLINE PANEL
     Clicking #chat-btn toggles .help-chat-wrap--open to expand the panel.
     Sending a message appends a user bubble, then after a short delay
     appends a typing indicator, then the agent's auto-reply.
  -------------------------------------------------------------------------- */
  (function initHelpChat() {
    var chatBtn  = document.getElementById("chat-btn");
    var chatWrap = document.getElementById("help-chat-wrap");
    var chatInput  = document.getElementById("chat-input");
    var chatSend   = document.getElementById("chat-send");
    var chatHistory = document.getElementById("chat-history");
    if (!chatBtn || !chatWrap) return;

    // Auto-replies pool
    var replies = [
      "Obrigado pela sua mensagem! Um agente entrará em contato em breve.",
      "Recebemos sua dúvida. Nossa equipe responderá em até 24 horas.",
      "Entendido! Vou encaminhar sua solicitação para o time especializado.",
      "Ótima pergunta! Deixa eu verificar isso para você.",
      "Estamos verificando as informações da sua reserva. Um momento!"
    ];

    var replyIndex = 0;

    // --- Toggle panel ---
    chatBtn.addEventListener("click", function () {
      var isOpen = chatWrap.classList.toggle("help-chat-wrap--open");
      chatBtn.textContent = isOpen ? "Fechar chat" : "Chat online";
      if (isOpen) {
        setTimeout(function () { chatInput && chatInput.focus(); }, 60);
      }
    });

    if (!chatInput || !chatSend || !chatHistory) return;

    // --- Append a bubble ---
    function addBubble(text, type) {
      var bubble = document.createElement("div");
      bubble.className = "chat-bubble chat-bubble--" + type;
      bubble.textContent = text;
      chatHistory.appendChild(bubble);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      return bubble;
    }

    // --- Typing indicator ---
    function showTyping() {
      var bubble = document.createElement("div");
      bubble.className = "chat-bubble chat-bubble--agent chat-bubble--typing";
      bubble.innerHTML = "<span class='chat-bubble__dots'>" +
        "<span></span><span></span><span></span></span>";
      chatHistory.appendChild(bubble);
      chatHistory.scrollTop = chatHistory.scrollHeight;
      return bubble;
    }

    // --- Send message ---
    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;

      addBubble(text, "user");
      chatInput.value = "";
      chatSend.disabled = true;

      // Show typing for 1.2s then reply
      var typingBubble = showTyping();
      setTimeout(function () {
        typingBubble.remove();
        addBubble(replies[replyIndex % replies.length], "agent");
        replyIndex++;
        chatSend.disabled = false;
        chatInput.focus();
      }, 1200);
    }

    chatSend.addEventListener("click", sendMessage);

    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  })();


  /* -------------------------------------------------------------------------
     11. FAQ ACCORDION
     Builds FAQ items from a data array into #help-faq-list.
     The FAQ panel expands when the "Acesse" button on the FAQ card is clicked.
     Each question toggles independently; only one open at a time.
  -------------------------------------------------------------------------- */
  (function initHelpFaq() {
    var faqWrap = document.getElementById("help-faq-wrap");
    var faqList = document.getElementById("help-faq-list");
    if (!faqWrap || !faqList) return;

    // FAQ data
    var faqs = [
      {
        q: "Como posso cancelar minha reserva?",
        a: "Para cancelar, acesse 'Minha conta' > 'Minhas reservas' e clique em Cancelar. Reembolsos são processados em até 7 dias úteis, conforme a política da tarifa contratada."
      },
      {
        q: "Posso alterar as datas da minha viagem?",
        a: "Sim, alterações estão sujeitas à disponibilidade e à política tarifária. Acesse sua reserva e clique em Alterar datas. Diferenças de valor podem ser cobradas."
      },
      {
        q: "Como recebo meu voucher?",
        a: "O voucher é enviado para o e-mail cadastrado em até 24 horas após a confirmação do pagamento. Verifique também sua caixa de spam."
      },
      {
        q: "Quais formas de pagamento são aceitas?",
        a: "Aceitamos cartões de crédito (Visa, Mastercard, Amex), Pix e boleto bancário. Parcelamos em até 12x sem juros nos cartões."
      },
      {
        q: "Como entro em contato em caso de emergência?",
        a: "Nosso plantão de emergências atende 24h pelo número 0800 049 8790. Para situações urgentes durante a viagem, use esse número diretamente."
      }
    ];

    // Build accordion items
    faqs.forEach(function (item, i) {
      var dt = document.createElement("dt");
      dt.className = "faq-item";

      var btn = document.createElement("button");
      btn.className = "faq-item__question";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "faq-answer-" + i);
      btn.innerHTML =
        "<span>" + item.q + "</span>" +
        "<span class='faq-item__chevron' aria-hidden='true'>▼</span>";

      var dd = document.createElement("dd");
      dd.className = "faq-item__answer";
      dd.id = "faq-answer-" + i;
      dd.textContent = item.a;

      dt.appendChild(btn);
      dt.appendChild(dd);
      faqList.appendChild(dt);

      btn.addEventListener("click", function () {
        var isOpen = dt.classList.contains("faq-item--open");

        // Close all
        faqList.querySelectorAll(".faq-item").forEach(function (el) {
          el.classList.remove("faq-item--open");
          el.querySelector(".faq-item__question").setAttribute("aria-expanded", "false");
        });

        // Open this one unless it was already open
        if (!isOpen) {
          dt.classList.add("faq-item--open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    // Wire up the "Acesse" button on the FAQ card — scrolls to FAQ section
    var faqCardBtn = document.querySelector("[data-action='faq']");
    if (faqCardBtn) {
      faqCardBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        faqWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  })();

  /* -------------------------------------------------------------------------
     FIXES OBRIGATÓRIOS
  -------------------------------------------------------------------------- */

  /* Fix: date input — min = mês atual, max = +12 meses */
  (function fixDateInput() {
    var dateInput = document.getElementById("hero-date");
    if (!dateInput) return;
    var now = new Date();
    dateInput.min = now.toISOString().slice(0, 7);
    var maxDate = new Date();
    maxDate.setFullYear(now.getFullYear() + 1);
    dateInput.max = maxDate.toISOString().slice(0, 7);
  })();

  /* Fix: FAQ — sempre visível ao carregar (garante que JS não esconda) */
  (function fixFaqVisible() {
    var wrap = document.getElementById("help-faq-wrap");
    if (!wrap) return;
    wrap.style.maxHeight  = "none";
    wrap.style.opacity    = "1";
    wrap.style.overflow   = "visible";
  })();

  /* ── FAB CHAT — only runs on help page ── */
  if (document.body.classList.contains("help-page")) {
    (function initHelpFab() {
      var fab      = document.getElementById("help-chat-fab");
      var fabIcon  = fab ? fab.querySelector(".help-chat-fab__icon") : null;
      var window_  = document.getElementById("help-chat-window");
      var closeBtn = document.getElementById("help-chat-close");
      var input    = document.getElementById("help-chat-input");
      var sendBtn  = document.getElementById("help-chat-send");
      var messages = document.getElementById("help-chat-messages");
      var statusDot  = document.getElementById("help-chat-status-dot");
      var statusText = document.getElementById("help-chat-status-text");
      if (!fab || !window_) return;

      /* Status: online seg–sex 09h–18h */
      (function updateStatus() {
        var now = new Date();
        var day = now.getDay();
        var h   = now.getHours();
        var online = day >= 1 && day <= 5 && h >= 9 && h < 18;
        if (statusDot)  statusDot.className  = "help-chat-status__dot help-chat-status__dot--" + (online ? "online" : "offline");
        if (statusText) statusText.textContent = online ? "Estamos online!" : "Estamos offline!";
      })();

      var replies = [
        "Olá! Como posso te ajudar hoje?",
        "Entendido! Um agente entrará em contato em breve.",
        "Pode deixar, vou verificar isso para você.",
        "Recebemos sua mensagem. Responderemos em instantes.",
        "Obrigado pelo contato! Nossa equipe está online."
      ];
      var replyIndex = 0;
      var welcomed = false;

      /* FAB icon toggle */
      function setFabIcon(isOpen) {
        if (!fabIcon) return;
        if (isOpen) {
          fabIcon.style.display = "none";
          var xi = fab.querySelector(".help-chat-fab__close-icon");
          if (!xi) {
            xi = document.createElement("span");
            xi.className = "help-chat-fab__close-icon";
            xi.textContent = "✕";
            xi.style.cssText = "font-size:1.2rem;font-weight:700;line-height:1;color:#1a1a1a;";
            fab.appendChild(xi);
          } else {
            xi.style.display = "";
          }
        } else {
          fabIcon.style.display = "";
          var xi = fab.querySelector(".help-chat-fab__close-icon");
          if (xi) xi.style.display = "none";
        }
      }

      /* Open / close */
      function openChat() {
        window_.classList.add("help-chat-window--open");
        window_.setAttribute("aria-hidden", "false");
        fab.setAttribute("aria-expanded", "true");
        setFabIcon(true);
        if (!welcomed) {
          welcomed = true;
          setTimeout(function () { addBubble("👋 Olá! Como podemos te ajudar?", "agent"); }, 400);
        }
        setTimeout(function () { if (input) input.focus(); }, 100);
      }

      function closeChat() {
        window_.classList.remove("help-chat-window--open");
        window_.setAttribute("aria-hidden", "true");
        fab.setAttribute("aria-expanded", "false");
        setFabIcon(false);
        fab.focus();
      }

      fab.addEventListener("click", function () {
        window_.classList.contains("help-chat-window--open") ? closeChat() : openChat();
      });

      if (closeBtn) closeBtn.addEventListener("click", closeChat);

      /* Close on Escape */
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && window_.classList.contains("help-chat-window--open")) closeChat();
      });

      /* Bubble helpers */
      function addBubble(text, type) {
        var b = document.createElement("div");
        b.className = "help-chat-bubble help-chat-bubble--" + type;
        b.textContent = text;
        messages.appendChild(b);
        messages.scrollTop = messages.scrollHeight;
        return b;
      }

      function addTyping() {
        var b = document.createElement("div");
        b.className = "help-chat-bubble help-chat-bubble--agent help-chat-bubble--typing";
        b.innerHTML = "<span></span><span></span><span></span>";
        messages.appendChild(b);
        messages.scrollTop = messages.scrollHeight;
        return b;
      }

      /* Send message */
      function sendMessage() {
        if (!input) return;
        var text = input.value.trim();
        if (!text) return;
        addBubble(text, "user");
        input.value = "";
        sendBtn.disabled = true;
        var tb = addTyping();
        setTimeout(function () {
          tb.remove();
          addBubble(replies[replyIndex % replies.length], "agent");
          replyIndex++;
          sendBtn.disabled = false;
          if (input) input.focus();
        }, 1200);
      }

      if (sendBtn) sendBtn.addEventListener("click", sendMessage);
      if (input) {
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
        });
      }
    })();
  }

  /* -------------------------------------------------------------------------
     CONTACT PAGE — Scroll suave ao formulário
     Só executa se o botão #btn-scroll-form existir (contact.html).
     Ao clicar em "Enviar mensagem →" no card:
       1. Faz scroll suave até #contact-form
       2. Adiciona .contact-scroll-form--highlight por 1.8s (borda animada)
       3. Foca no primeiro campo do formulário para acessibilidade
  -------------------------------------------------------------------------- */
  (function initScrollToForm() {
    var btn  = document.getElementById("btn-scroll-form");
    var form = document.getElementById("contact-form");
    if (!btn || !form) return; // não roda em nenhuma outra página

    btn.addEventListener("click", function () {
      /* 1. Scroll suave */
      form.scrollIntoView({ behavior: "smooth", block: "start" });

      /* 2. Destaque visual — remove e reaplica para religar animação */
      form.classList.remove("contact-scroll-form--highlight");
      void form.offsetWidth; // força reflow
      form.classList.add("contact-scroll-form--highlight");

      /* 3. Foca no primeiro campo após o scroll terminar (~600ms) */
      setTimeout(function () {
        var firstInput = form.querySelector("input, textarea");
        if (firstInput) firstInput.focus();
      }, 650);
    });

    /* Remove highlight após a animação terminar */
    form.addEventListener("animationend", function () {
      form.classList.remove("contact-scroll-form--highlight");
    });

    /* Submit simples com validação mínima */
    var submitBtn = document.getElementById("sf-submit");
    var success   = document.getElementById("sf-success");
    if (!submitBtn || !success) return;

    submitBtn.addEventListener("click", function () {
      var name  = document.getElementById("sf-name");
      var email = document.getElementById("sf-email");
      var msg   = document.getElementById("sf-msg");
      var valid = name && name.value.trim() !== "" &&
                  email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
                  msg && msg.value.trim() !== "";

      if (!valid) {
        [name, email, msg].forEach(function (el) {
          if (el && el.value.trim() === "") el.classList.add("contact-scroll-form__input--error");
        });
        return;
      }

      /* Limpa erros e mostra sucesso */
      [name, email, msg].forEach(function (el) {
        if (el) el.classList.remove("contact-scroll-form__input--error");
      });
      success.classList.add("contact-scroll-form__success--visible");
      submitBtn.disabled = true;

      /* Reset após 4s */
      setTimeout(function () {
        [name, email, msg, document.getElementById("sf-subject")].forEach(function (el) {
          if (el) el.value = "";
        });
        success.classList.remove("contact-scroll-form__success--visible");
        submitBtn.disabled = false;
      }, 4000);
    });

    /* Remove erro ao digitar */
    form.querySelectorAll(".contact-scroll-form__input").forEach(function (el) {
      el.addEventListener("input", function () {
        el.classList.remove("contact-scroll-form__input--error");
      });
    });
  })();

  /* ── GLOBAL FAB CHAT — runs on all pages except help (which has its own) ── */
  if (!document.body.classList.contains("help-page")) {
    (function initGlobalFab() {
      var fab      = document.getElementById("global-chat-fab");
      var fabIcon  = fab ? fab.querySelector(".global-chat-fab__icon") : null;
      var win      = document.getElementById("global-chat-window");
      var input    = document.getElementById("global-chat-input");
      var sendBtn  = document.getElementById("global-chat-send");
      var messages = document.getElementById("global-chat-messages");
      var statusDot  = document.getElementById("global-chat-status-dot");
      var statusText = document.getElementById("global-chat-status-text");
      if (!fab || !win) return;

      /* Status: online seg–sex 09h–18h */
      (function updateStatus() {
        var now = new Date();
        var day = now.getDay();
        var h   = now.getHours();
        var online = day >= 1 && day <= 5 && h >= 9 && h < 18;
        if (statusDot)  statusDot.className  = "global-chat-status__dot global-chat-status__dot--" + (online ? "online" : "offline");
        if (statusText) statusText.textContent = online ? "Estamos online!" : "Estamos offline!";
      })();

      var replies = [
        "Olá! Como posso te ajudar hoje?",
        "Entendido! Um agente entrará em contato em breve.",
        "Pode deixar, vou verificar isso para você.",
        "Recebemos sua mensagem. Responderemos em instantes.",
        "Obrigado pelo contato! Nossa equipe está online."
      ];
      var replyIndex = 0;
      var welcomed = false;

      function setFabIcon(isOpen) {
        if (!fabIcon) return;
        if (isOpen) {
          fabIcon.style.display = "none";
          var xi = fab.querySelector(".global-chat-fab__close-icon");
          if (!xi) {
            xi = document.createElement("span");
            xi.className = "global-chat-fab__close-icon";
            xi.textContent = "✕";
            xi.style.cssText = "font-size:1.2rem;font-weight:700;line-height:1;color:#1a1a1a;";
            fab.appendChild(xi);
          } else {
            xi.style.display = "";
          }
        } else {
          fabIcon.style.display = "";
          var xi = fab.querySelector(".global-chat-fab__close-icon");
          if (xi) xi.style.display = "none";
        }
      }

      function openChat() {
        win.classList.add("global-chat-window--open");
        win.setAttribute("aria-hidden", "false");
        fab.setAttribute("aria-expanded", "true");
        setFabIcon(true);
        if (!welcomed) {
          welcomed = true;
          setTimeout(function () { addBubble("👋 Olá! Como podemos te ajudar?", "agent"); }, 400);
        }
        setTimeout(function () { if (input) input.focus(); }, 100);
      }

      function closeChat() {
        win.classList.remove("global-chat-window--open");
        win.setAttribute("aria-hidden", "true");
        fab.setAttribute("aria-expanded", "false");
        setFabIcon(false);
        fab.focus();
      }

      fab.addEventListener("click", function () {
        win.classList.contains("global-chat-window--open") ? closeChat() : openChat();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && win.classList.contains("global-chat-window--open")) closeChat();
      });

      function addBubble(text, type) {
        var b = document.createElement("div");
        b.className = "global-chat-bubble global-chat-bubble--" + type;
        b.textContent = text;
        messages.appendChild(b);
        messages.scrollTop = messages.scrollHeight;
        return b;
      }

      function addTyping() {
        var b = document.createElement("div");
        b.className = "global-chat-bubble global-chat-bubble--agent global-chat-bubble--typing";
        b.innerHTML = "<span></span><span></span><span></span>";
        messages.appendChild(b);
        messages.scrollTop = messages.scrollHeight;
        return b;
      }

      function sendMessage() {
        if (!input) return;
        var text = input.value.trim();
        if (!text) return;
        addBubble(text, "user");
        input.value = "";
        sendBtn.disabled = true;
        var tb = addTyping();
        setTimeout(function () {
          tb.remove();
          addBubble(replies[replyIndex % replies.length], "agent");
          replyIndex++;
          sendBtn.disabled = false;
          if (input) input.focus();
        }, 1200);
      }

      if (sendBtn) sendBtn.addEventListener("click", sendMessage);
      if (input) {
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
        });
      }
    })();
  }

  /* ── LANGUAGE DROPDOWN ── */
  (function initLangDropdown() {
    var btn      = document.getElementById("header-lang-btn");
    var dropdown = document.getElementById("header-lang-dropdown");
    var flagImg  = document.getElementById("header-lang-flag");
    var codeSpan = document.getElementById("header-lang-code");
    if (!btn || !dropdown) return;

    function toggleDropdown(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.classList.toggle("header-lang--open", open);
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = btn.classList.contains("header-lang--open");
      toggleDropdown(!isOpen);
    });

    dropdown.querySelectorAll(".header-lang__option").forEach(function (opt) {
      opt.addEventListener("click", function (e) {
        e.stopPropagation();
        var lang = opt.getAttribute("data-lang");
        var flag = opt.getAttribute("data-flag");
        var alt  = opt.getAttribute("data-alt");
        if (flagImg) { flagImg.src = flag; flagImg.alt = alt; }
        if (codeSpan) codeSpan.textContent = lang;
        toggleDropdown(false);
      });
    });

    document.addEventListener("click", function () { toggleDropdown(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggleDropdown(false);
    });
  })();

  /* ── LOGIN MODAL — runs on all pages ── */
  (function initLoginModal() {
    var isSubpage = window.location.pathname.indexOf("/pages/") !== -1;
    var prefix    = isSubpage ? "../imagens/" : "./imagens/";

    var overlay = document.createElement("div");
    overlay.className = "login-modal-overlay";
    overlay.id        = "login-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "login-modal-title");
    overlay.innerHTML = '\
      <div class="login-modal" id="login-modal">\
        <div class="login-modal__header">\
          <button class="login-modal__close" id="login-modal-close" aria-label="Fechar login">✕</button>\
          <img src="' + prefix + 'logo.png" alt="Just Travel" class="login-modal__logo">\
          <h2 class="login-modal__title" id="login-modal-title">Bem-vindo de volta</h2>\
          <p class="login-modal__subtitle">Acesse sua conta Just Travel</p>\
        </div>\
        <div class="login-modal__body">\
          <div class="login-modal__field">\
            <label for="lm-email" class="login-modal__label">E-mail</label>\
            <input class="login-modal__input" id="lm-email" type="email" placeholder="seu@email.com" autocomplete="email">\
          </div>\
          <div class="login-modal__field">\
            <label for="lm-pass" class="login-modal__label">Senha</label>\
            <input class="login-modal__input" id="lm-pass" type="password" placeholder="Sua senha">\
          </div>\
          <div class="login-modal__row">\
            <label class="login-modal__remember"><input type="checkbox"> Lembrar de mim</label>\
            <span class="login-modal__forgot">Esqueceu a senha?</span>\
          </div>\
          <button class="login-modal__submit" id="lm-submit">Entrar ✈</button>\
          <div class="login-modal__divider">ou</div>\
          <p class="login-modal__register">Não tem conta? <a id="lm-register-link">Cadastre-se grátis</a></p>\
        </div>\
        <div class="login-modal__success">\
          <div class="login-modal__success-icon">✈</div>\
          <p class="login-modal__success-text">Login realizado!</p>\
          <p class="login-modal__success-sub">Boa viagem, viajante. ✨</p>\
        </div>\
      </div>';

    document.body.appendChild(overlay);

    var modal     = document.getElementById("login-modal");
    var closeBtn  = document.getElementById("login-modal-close");
    var submitBtn = document.getElementById("lm-submit");
    var emailInp  = document.getElementById("lm-email");
    var passInp   = document.getElementById("lm-pass");

    function openModal() {
      overlay.classList.add("login-modal-overlay--open");
      document.body.classList.add("modal-open");
      setTimeout(function () { if (emailInp) emailInp.focus(); }, 100);
    }

    function closeModal() {
      overlay.classList.remove("login-modal-overlay--open");
      document.body.classList.remove("modal-open");
      setTimeout(function () {
        modal.classList.remove("login-modal--success");
        if (emailInp) emailInp.value = "";
        if (passInp)  passInp.value  = "";
      }, 300);
    }

    document.querySelectorAll(".header-auth--login").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("login-modal-overlay--open")) closeModal();
    });

    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        var email = emailInp ? emailInp.value.trim() : "";
        var pass  = passInp  ? passInp.value.trim()  : "";
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (emailInp) { emailInp.focus(); emailInp.style.borderColor = "#e05252"; }
          return;
        }
        if (!pass) {
          if (passInp) { passInp.focus(); passInp.style.borderColor = "#e05252"; }
          return;
        }
        if (emailInp) emailInp.style.borderColor = "";
        if (passInp)  passInp.style.borderColor  = "";
        modal.classList.add("login-modal--success");
        setTimeout(closeModal, 2200);
      });
    }

    [emailInp, passInp].forEach(function (el) {
      if (el) el.addEventListener("input", function () { el.style.borderColor = ""; });
    });
    [emailInp, passInp].forEach(function (el) {
      if (el) el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); submitBtn && submitBtn.click(); }
      });
    });
  })();

}); // end DOMContentLoaded
