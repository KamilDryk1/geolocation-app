"use strict";

const mainPanel = document.querySelector(".main__panel");
const h1 = document.querySelector(".main__h1");
const h2 = document.querySelector(".main__h2");

class App {
  #map;
  #location;
  #cityObj;
  #infoBtn;
  constructor() {
    this._initialization();
  }

  _initialization() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(function (position) {
        resolve(position);
        if (!position)
          reject(new Error("Problem with getting position. Try to reload."));
      });
    })
      .then((position) => this._getCoords(position))
      .then(() => this._renderMap())
      .then(() => this._createYourMarker())
      .then(() => this._getCityName())
      .catch((err) => console.error(err));
  }

  _renderMap() {
    this.#map = L.map("map").setView(this.#location, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }

  _getCoords(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    this.#location = [latitude, longitude];
  }

  _createYourMarker() {
    L.marker(this.#location).addTo(this.#map);
  }

  _getCityName() {
    fetch(
      `https://geocode.xyz/${this.#location[0]},${
        this.#location[1]
      }?geoit=json&auth=878324637504227881297x116015 `
    )
      .then((response) => response.json())
      .then((response) => (this.#cityObj = response))
      .then(() => this._renderTitle())
      .catch((err) => console.error(`Problem with geocode server ${err}`));
  }

  _renderTitle() {
    h1.textContent = `${this.#cityObj.city}`;
    h2.textContent = `${this.#cityObj.country}`;
    this.#infoBtn = document.createElement("button");
    this.#infoBtn.classList.add("main__btn");
    this.#infoBtn.textContent = "get more info";
    mainPanel.appendChild(this.#infoBtn);
    this.#infoBtn.addEventListener("click", this._renderInfo.bind(this));
  }

  _renderInfo() {
    const html = `
      <section class="main__section">
        <p>Coords: ${this.#location[0]}, ${this.#location[1]}</p>
        <p>Postal: ${this.#cityObj.postal}</p>
        <p>Street: ${this.#cityObj.staddress}</p>
        <p>Region: ${this.#cityObj.region}</p>
        <p>Timezone: ${this.#cityObj.timezone}</p>
      </section>
    `;
    mainPanel.insertAdjacentHTML("beforeend", html);
    this.#infoBtn.remove();
  }
}

const app = new App();
