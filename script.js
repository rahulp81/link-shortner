const navBar = document.querySelector(".nav-wrapper");
const primaryNavigation = document.querySelector(".primary-navigation");
const mobNavToggle = document.querySelector(".mobile-nav-toggle");
const form = document.querySelector("form");
const input = document.querySelector("input");
const errorMsg = document.querySelector("#err-msg");
const linkContainer = document.querySelector(".shortned-links-container");
const linkCard = document.querySelector(".shortned-link");
const focusButton = document.querySelectorAll("#link-focus");

const pattern =
  /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})(\.[a-zA-Z0-9]{2,})?/gi;
const regEx = new RegExp(pattern);

const shortenedLinks = JSON.parse(localStorage.getItem("storedLinks")) || [];
if (shortenedLinks) {
  shortenedLinks.forEach((link) => {
    renderLinkCard(link);
  });
}

focusButton.forEach((button) => {
  button.addEventListener("click", () => {
    input.focus();
  });
});

mobNavToggle.addEventListener("click", () => {
  primaryNavigation.toggleAttribute("data-overlay");
  mobNavToggle.toggleAttribute("data-active");
});

form.onsubmit = (e) => {
  e.preventDefault();

  if (!input.value) {
    errorMessage("Please add a Link");
    return;
  }

  const url = input.value;
  if (url.match(regEx)) {
    fetch(`https://api.shrtco.de/v2/shorten?url=${url}`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok === true) {
          renderLinkCard(data.result); // Create Link Card
          return;
        } else if (data.ok === false) {
          const error_code = data.error_code;
          switch (error_code) {
            case 2:
              errorMessage("Link is Non Existent"); // Invalid link / doesn't exist
              break;
            case 10:
              errorMessage("Disallowed Link"); // Disallowed Link
              break;
            default:
              errorMessage("Please Re-Enter a Valid Link"); // General invalid URL link error
              break;
          }
          return;
        }
      })
      .catch((error) => {
        console.error(error); // Handle any fetch or parsing errors
      });
  } else {
    errorMessage("Re-Enter a Valid Link!"); // General invalid URL link error
    return;
  }
};

function renderLinkCard(result) {
  const linkCardDiv = document.createElement("div");
  linkCardDiv.classList.add("shortend-link");
  const divOne = document.createElement("div");
  const longLink = document.createElement("p");
  longLink.innerText = result.original_link;
  divOne.appendChild(longLink);
  linkCardDiv.appendChild(divOne);

  const divTwo = document.createElement("div");
  const shortened = document.createElement("p");
  shortened.setAttribute("id", "shortened");
  shortened.innerText = result.short_link2;
  divTwo.appendChild(shortened);
  const button = document.createElement("button");
  button.innerText = "Copy";
  button.onclick = () => {
    const shortnedLink = shortened.innerText;
    navigator.clipboard.writeText(shortnedLink).then(() => {
      button.textContent = "Copied!";
      button.toggleAttribute("data-copied");
    });
  };
  divTwo.appendChild(button);
  linkCardDiv.appendChild(divTwo);

  linkContainer.appendChild(linkCardDiv);

  const linkData = {
    original_link: result.original_link,
    short_link2: result.short_link2,
  };
  storeLink(linkData);
}

function errorMessage(err) {
  errorMsg.innerText = err;
  input.classList.add("data-invalid");
  input.oninput = () => {
    errorMsg.innerText = "";
    input.classList.remove("data-invalid");
  };
}

function storeLink(result) {
  let linkExists = false;

  if (shortenedLinks) {
    shortenedLinks.forEach((link) => {
      if (link.short_link2 == result.short_link2) linkExists = true;
      return;
    });
  }

  if (linkExists) return;

  shortenedLinks.push(result);
  const data = JSON.stringify(shortenedLinks);
  localStorage.setItem("storedLinks", data);
}
