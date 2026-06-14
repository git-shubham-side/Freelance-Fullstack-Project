const initAuthPage = () => {
  const pageParams = new URLSearchParams(window.location.search);
  const returnTo = pageParams.get("returnTo");
  const loginForm = document.querySelector("body.auth-page--login form");
  const signupForm = document.querySelector("body.auth-page--signup form");
  const googleBtn = document.querySelector("a.google-btn");
  const secondaryAuthLink = document.querySelector(
    "body.auth-page--login .auth-link-row a, body.auth-page--signup .auth-switch a",
  );

  if (returnTo) {
    const encodedReturnTo = encodeURIComponent(returnTo);

    if (
      loginForm &&
      loginForm.getAttribute("action")?.includes("/api/v1/login")
    ) {
      loginForm.setAttribute(
        "action",
        `/api/v1/login?returnTo=${encodedReturnTo}`,
      );

      const hiddenReturnInput = loginForm.querySelector(
        'input[name="returnTo"]',
      );
      if (!hiddenReturnInput) {
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "returnTo";
        hiddenInput.value = returnTo;
        loginForm.prepend(hiddenInput);
      } else {
        hiddenReturnInput.value = returnTo;
      }
    }

    if (
      signupForm &&
      signupForm.getAttribute("action")?.includes("/api/v1/signup")
    ) {
      signupForm.setAttribute(
        "action",
        `/api/v1/signup?returnTo=${encodedReturnTo}`,
      );

      const hiddenReturnInput = signupForm.querySelector(
        'input[name="returnTo"]',
      );
      if (!hiddenReturnInput) {
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "returnTo";
        hiddenInput.value = returnTo;
        signupForm.prepend(hiddenInput);
      } else {
        hiddenReturnInput.value = returnTo;
      }
    }

    if (googleBtn) {
      googleBtn.setAttribute(
        "href",
        `/api/v1/auth/google?returnTo=${encodedReturnTo}`,
      );
    }

    if (secondaryAuthLink) {
      const targetPath = secondaryAuthLink.getAttribute("href") || "";
      if (targetPath.startsWith("/api/v1/login")) {
        secondaryAuthLink.setAttribute(
          "href",
          `/api/v1/login?returnTo=${encodedReturnTo}`,
        );
      } else if (targetPath.startsWith("/api/v1/signup")) {
        secondaryAuthLink.setAttribute(
          "href",
          `/api/v1/signup?returnTo=${encodedReturnTo}`,
        );
      }
    }
  }

  if (window.AOS) {
    AOS.init({ once: true, easing: "cubic-bezier(0.25, 1, 0.5, 1)" });
  }

  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePassword.classList.toggle("fa-eye");
      togglePassword.classList.toggle("fa-eye-slash");
    });
  }

  const cursor = document.getElementById("custom-cursor");
  if (cursor && window.innerWidth > 992) {
    document.addEventListener("mousemove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });

    document
      .querySelectorAll("a, button, input, .checkbox-wrapper, .password-toggle")
      .forEach((element) => {
        element.addEventListener("mouseenter", () => {
          cursor.style.width = "40px";
          cursor.style.height = "40px";
          cursor.style.backgroundColor = "rgba(194, 155, 104, 0.1)";
        });

        element.addEventListener("mouseleave", () => {
          cursor.style.width = "20px";
          cursor.style.height = "20px";
          cursor.style.backgroundColor = "transparent";
        });
      });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthPage);
} else {
  initAuthPage();
}
