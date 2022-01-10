'use strict';

//submit btn form to add fowrout
//edit workout
//delete workout
//detele all workout

// prettier-ignore
// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//Active
// const editBtn = document.getElementsByTagName('.edit__btn');
// const p1 = document.querySelector('p1');
// let counter = 0;

//has to use map insdie the mapping on load

////////////////////////////////////////////////////////////
//STORING OBJECT DATA

class Workout {
  date = new Date();
  //if new Date object to string will include words. Unique time stam pid will not work in realworld when two users input workout at soame time
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; //an array of [lat,long]
    this.distance = distance; // in km
    this.duration = duration; // in min
    this._setDescription;
  }

  _setDescription() {
    // prettier-ignore
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    //create new propety call description
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    //km/hr
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Cycling([39, -12], 27, 55, 528);
// console.log(run1);
// console.log(cycling1);

////////////////////////////////////////////////////////////
//APPLICATION ARCHTECHTURE
class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }
  ///////////////
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    console.log('got position');
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    console.log('map loading');
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
    console.log('map loaded');
  }
  ///////////
  _showForm(mapE) {
    let counter = 1;
    if (counter === 1)
      document.querySelector('p1').textContent =
        'Step 2: Input workout information, then press enter';
    else {
      document.querySelector('p1').textContent = '';
    }

    this.#mapEvent = mapE;
    console.log('show');
    form.classList.remove('hidden');
    inputDistance.focus();

    //Active
    // if (counter === 1)
    //   document.querySelector('p1').textContent =
    //     'Step 2: Input workout information, then press enter';
    // else {
    //   document.querySelector('p1').textContent = '';
    // }
  }

  _hideForm() {
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    //stop sliding after hide form
    form.style.display = 'none';
    form.classList.add('hidden');
    //after one sec set the style back to grif to slide
    setTimeout(() => {
      form.style.display = 'grid';
    }, 1000);
    document.querySelector('p1').textContent = '';
  }

  _toggleElevationField() {
    //toggle to cadence and elevation gain
    //selcted closest parent, no children  to the form row
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //SUBBMIT form for new workout
  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp >= 0);
    e.preventDefault(); //stop page on reloading after submit

    //get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng; //# ?

    let workout;
    //NUmber validation

    //if running create runing Object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
        //if all numbers will be true, so if not true, return
      ) {
        //check data valid
        //guard clause
        return alert('Inputs must be positive numbers!');
      }
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //if cyclign reate cycling objec
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //check data valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert('Inputs must be positive numbers!');
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    this.#workouts.push(workout);

    //add new object t oworkour array

    //render workout on marler
    this._renderWorkoutMarker(workout);
    //render workout on list
    this._renderWorkout(workout);
    //CLear input fields & hide form

    this._hideForm();

    //Set local storage to all workouts
    this._setLocalStorage();
  }
  _renderWorkoutMarker(workout) {
    //takes array of corodnaes
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    //insert html as sibling elemnt
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">

      <h2 class="workout__title">${workout.description}
      </h2> 
      <!-- <button class="edit__btn">edit</button> -->

      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
  `;

    if (workout.type === 'running')
      html += `<div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${workout.pace.toFixed(1)}</span>
  <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
  <span class="workout__icon">🦶🏼</span>
  <span class="workout__value">${workout.cadence.toFixed(1)}</span>
  <span class="workout__unit">spm</span>
  </div>
  </li>`;

    if (workout.type === 'cycling')
      html += `
  <div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${workout.speed.toFixed(1)}</span>
  <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
  <span class="workout__icon">⛰</span>
  <span class="workout__value">${workout.elevation}</span>
  <span class="workout__unit">m</span>
  </div>
  </li>`;
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopUp(e) {
    const workoutEl = e.target.closest('.workout');
    //console.log(workoutEl);
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    // console.log(workout);
    // //using Public interface
    // console.log('ad');
    // console.log(workout.click);

    //get the coordinates and move to

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    //convert string to object.
    //0: workout 1, 1: work out 2
    //object will not have prototypes
    //console.log(data);
    //guard clause if data is not there
    if (!data) return;

    //with the data restore workouts array

    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

// const map = L.map('map').setView([51.505, -0.09], 13);

// L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);
