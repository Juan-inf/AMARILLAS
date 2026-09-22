/* Pantalla de bienvenida en dos pasos:
   1) pide el nombre de quien recibe el regalo.
   2) muestra un mensaje animado letra por letra con ese nombre y,
      al terminar, el botón para abrir el regalo con música.
   music.js escucha los clics en ".intro_btn" (creado aquí) para
   reproducir el audio y revelar el ramo.

   Además, personaliza el mensaje amplio de la tarjeta que cuelga junto
   al ramo (en index.html) para que empiece con el nombre ingresado.
*/
(function () {
    "use strict";

    if (typeof document === "undefined") {
        return;
    }

    var intro = document.querySelector(".intro");
    if (!intro) {
        return;
    }

    var box = intro.querySelector(".intro_box");
    var title = intro.querySelector(".intro_title");
    var sub = intro.querySelector(".intro_sub");
    var form = intro.querySelector(".intro_form");
    var input = intro.querySelector(".intro_input");

    if (!box || !form || !input) {
        return;
    }

    var LETTER_STEP = 45;   // ms entre letra y letra
    var LETTER_DURATION = 600;

    // Construye el mensaje letra por letra dentro de "container".
    // Cada letra es su propio <span> para poder animarla por separado;
    // se usa textContent (no innerHTML) para que el nombre nunca se
    // interprete como HTML.
    function buildLetters(container, text) {
        var chars = Array.from(text);

        chars.forEach(function (ch, i) {
            var span = document.createElement("span");
            span.className = "letter";
            span.textContent = ch;
            span.style.setProperty("--i", i);
            if (ch === " ") {
                span.classList.add("letter-space");
            }
            container.appendChild(span);
        });

        return chars.length;
    }

    // La tarjeta junto al ramo (index.html, clase ".tag") trae un mensaje
    // genérico por si este script no llega a correr. En cuanto hay un
    // nombre, se lo reemplaza por uno que empieza con ese nombre.
    // Se usa textContent, no innerHTML: el nombre nunca se interpreta
    // como HTML.
    function personalizeTag(name) {
        var tagText = document.querySelector(".tag_text");
        if (!tagText) {
            return;
        }

        tagText.textContent =
            name + ", que este Día de las Flores Amarillas te recuerde " +
            "lo especial que eres. Que la alegría te acompañe como el " +
            "sol acompaña al girasol, que cada pétalo de este ramo te " +
            "regale una sonrisa, y que la luz de sus colores te alcance " +
            "siempre. ¡Feliz Día de las Flores Amarillas!";
    }

    function showGreeting(name) {
        form.remove();
        if (title) title.remove();
        if (sub) sub.remove();

        personalizeTag(name);

        var text = "¡Feliz Día de las Flores Amarillas, " + name + "!";

        var message = document.createElement("p");
        message.className = "intro_message";
        message.setAttribute("aria-label", text);

        var count = buildLetters(message, text);

        Array.prototype.forEach.call(message.querySelectorAll(".letter"), function (el) {
            el.setAttribute("aria-hidden", "true");
        });

        var spark = document.createElement("p");
        spark.className = "intro_spark";
        spark.setAttribute("aria-hidden", "true");
        spark.textContent = "🌻 🌼 🌻";

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "intro_btn";
        btn.textContent = "Abrir regalo con música";

        var typingEnd = count * LETTER_STEP + LETTER_DURATION;
        spark.style.animationDelay = typingEnd + "ms";
        btn.style.animationDelay = (typingEnd + 350) + "ms";

        box.appendChild(message);
        box.appendChild(spark);
        box.appendChild(btn);
        box.classList.add("intro_box-greeting");
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var name = input.value.trim().slice(0, 24);

        if (!name) {
            input.focus();
            return;
        }

        showGreeting(name);
    });
})();
