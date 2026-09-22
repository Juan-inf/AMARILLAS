/* Música de fondo:
   reproduce Flores_amarillas.mp3
   (debe estar en esta misma carpeta).
*/

(function () {
    "use strict";

    // Evita errores si este archivo se ejecuta fuera del navegador,
    // por ejemplo con "node music.js".
    if (typeof document === "undefined" || typeof window === "undefined") {
        console.warn(
            "music.js está diseñado para ejecutarse dentro de un navegador."
        );
        return;
    }

    var SRC = "Flores_amarillas.mp3";
    var VOLUME = 0.6;
    var FADE_IN = 1500;
    var FADE_OUT = 400;

    var body = document.body;
    var button = document.querySelector(".music");
    var intro = document.querySelector(".intro");

    var audio = new Audio(SRC);
    var fadeTimer = null;

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    // Con setInterval en vez de requestAnimationFrame: el volumen sube igual
    // aunque la pestaña esté en segundo plano o el navegador deje de pintar
    // fotogramas (requestAnimationFrame se puede quedar detenido ahí, y el
    // audio se queda sonando en silencio para siempre).
    function fadeTo(target, duration, done) {
        if (fadeTimer) {
            clearInterval(fadeTimer);
            fadeTimer = null;
        }

        target = Math.max(0, Math.min(1, target));

        if (duration <= 0) {
            audio.volume = target;

            if (done) {
                done();
            }

            return;
        }

        var startVolume = audio.volume;
        // performance.now() nunca retrocede; Date.now() sí puede hacerlo
        // (ajustes de hora del sistema), y eso puede dar un progreso
        // negativo que el navegador rechaza al asignarlo a audio.volume.
        var startTime = performance.now();

        fadeTimer = setInterval(function () {
            var progress = Math.min(
                1,
                Math.max(0, (performance.now() - startTime) / duration)
            );

            // Recortado por si acaso, para que audio.volume nunca reciba
            // un valor fuera de [0, 1] (eso lanza un error, no lo redondea).
            audio.volume = Math.max(
                0,
                Math.min(
                    1,
                    startVolume + (target - startVolume) * progress
                )
            );

            if (progress >= 1) {
                clearInterval(fadeTimer);
                fadeTimer = null;

                if (done) {
                    done();
                }
            }
        }, 40);
    }

    function render() {
        if (!button) {
            return;
        }

        var playing = !audio.paused;

        button.classList.toggle("is-on", playing);

        button.setAttribute(
            "aria-pressed",
            playing ? "true" : "false"
        );

        button.setAttribute(
            "aria-label",
            playing
                ? "Silenciar música"
                : "Activar música"
        );
    }

    function reveal() {
        if (!body.classList.contains("waiting")) {
            return;
        }

        body.classList.remove("waiting");

        if (intro) {
            intro.classList.add("is-hidden");

            setTimeout(function () {
                if (intro && intro.parentNode) {
                    intro.remove();
                }
            }, 900);
        }
    }

    function playMusic() {
        var promise = audio.play();

        if (promise && typeof promise.then === "function") {
            promise
                .then(function () {
                    fadeTo(VOLUME, FADE_IN);
                    render();
                })
                .catch(function () {
                    render();
                });
        } else {
            fadeTo(VOLUME, FADE_IN);
            render();
        }

        return promise;
    }

    function pauseMusic() {
        fadeTo(0, FADE_OUT, function () {
            audio.pause();
            render();
        });
    }

    audio.addEventListener("play", render);
    audio.addEventListener("pause", render);

    audio.addEventListener("error", function () {
        reveal();

        if (button) {
            button.disabled = true;
            button.classList.remove("is-on");
            button.classList.add("is-missing");

            button.setAttribute(
                "aria-label",
                "Música no disponible"
            );

            button.title = "No se pudo cargar " + SRC;
        }
    });

    if (button) {
        button.addEventListener("click", function () {
            if (audio.paused) {
                playMusic();
            } else {
                pauseMusic();
            }
        });
    }

    if (intro) {
        // Delegado: el botón "Abrir regalo con música" lo crea intro.js
        // más tarde, después del paso del nombre y del mensaje animado.
        // Solo ese botón debe arrancar la música; el formulario del
        // nombre no.
        intro.addEventListener("click", function (event) {
            if (!event.target.closest(".intro_btn")) {
                return;
            }

            if (audio.paused) {
                playMusic();
            }

            reveal();
        });
    }

    // Intentar autoplay.
    var attempt = audio.play();

    if (attempt && typeof attempt.then === "function") {
        attempt
            .then(function () {
                fadeTo(VOLUME, FADE_IN);
                reveal();
                render();
            })
            .catch(function (error) {
                // El navegador puede bloquear el autoplay.
                // En ese caso esperamos el clic del usuario.
                if (!error || error.name !== "NotAllowedError") {
                    reveal();
                }

                render();
            });
    } else {
        fadeTo(VOLUME, FADE_IN);
        reveal();
        render();
    }
})();
