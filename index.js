/**
* Nicholas Harlow
* November 1, 2018
* 154 AL
* The pokedex will load the names and when clicked it will display the relative stats
* for the given pokemon.
*/

(function() {
  "use strict";

  //The main api url and the max pokemon loaded
  const POKE_URL = "https://pokeapi.co/api/v2";
  const MAX_POKE = 151;

  //Data about the pokemon saved for use later.
  let allPokemon;

  window.addEventListener("load", main);

  /**
  * Fetches and loads all the pokemon that are requested and puts them in a format to
  * later be able to recall the information about each pokemon.
  */
  function main() {
    let fetchResponses = [];
    for (let i = 0; i < MAX_POKE; i++) {
      fetchResponses.push(getPokemonData(i + 1));
    }
    Promise.all(fetchResponses).then(displayPokemonList).then(continueMain);

  }

  /**
  * Continues the main after all the fetch calls have been made and resolved.
  */
  function continueMain() {
    document.getElementById("search").addEventListener("keyup", filterList);
  }

  /**
  * Filters the list based on what the user input to the search bar.
  */
  function filterList() {
    let list = document.getElementById("list").children;
    let searchValue = document.getElementById("search").value.toLowerCase();
    for (let i = 0; i < list.length; i++) {
      if (!list[i].innerText.toLowerCase().includes(searchValue)) {
        list[i].classList.add("hidden");
      } else {
        list[i].classList.remove("hidden");
      }
    }
  }

  /**
  * Gets the pokemons inforomation based on the given id number
  * @param {Number} id the id of the pokemon to retrieve information for
  * @returns {Promise} A promise that the data was retrieved and packaged based on what is needed.
  */
  function getPokemonData(id) {
    let url = POKE_URL + "/pokemon/" + id + "/";
    return fetch(url, {mode: "cors"})
    .then(checkStatus)
    .then(JSON.parse)
    .then(processPromise)
    .catch(catchError);
  }

  /**
  * Extracts the needed information from the JSON for the specific pokemon
  * @param {Object} data a Json with all the data from the API for the pokemon
  * @returns {Object} A Object containing all of the information that is needed to display
  */
  function processPromise(data) {
    return {id: data.id, 
            name: data.name, 
            stats: data.stats, 
            sprites: data.sprites, 
            type: data.types};
  }

  /**
  * Sorts the given array and adds the pokemon to the page
  * @param {Array} data an array of all the pokemon's data to be tracked.
  */
  function displayPokemonList(data) {
    mergeSortPoke(data);
    addPokeToPage(data);
    allPokemon = data;
  }

  /**
  *  Makes list items for each pokemon and adds it to the nav list.
  * @param {Array} data an array of all the pokemon's data to be added
  */
  function addPokeToPage(data) {
    for (let i = 0; i < data.length; i++) {
      let element = document.createElement("li");
      let list = document.getElementById("list");
      let display = formattedNumber(data[i].id);
      display = display + capitilizeFirst(data[i].name);
      element.innerText = element.innerText + display;
      element.addEventListener("click", addPokeInfo);
      list.appendChild(element);
    }
  }
  
  /**
  *  Based on the clicked pokemon it adds the sprite and the stat information to the page.
  */
  function addPokeInfo() {
    let pokeId = parseInt(this.innerText);
    let pokeInfo = allPokemon[pokeId - 1];
    changeSprite(pokeInfo);
    changeStats(pokeInfo);
  }
  
  /**
  *  Given the information of the given pokemon, it displays the name and sprite of the pokemon.
  * @param {Object} pokeInfo All the information saved for the given pokemon.
  */
  function changeSprite(pokeInfo) {
    //Clear previous image
    let images = document.querySelectorAll("#sprites img");
    let imgLength = images.length;
    for (let i = 0; i < imgLength; i++) {
      images[0].remove();
    }
    //Clear text
    document.querySelector("#sprites p").innerText = capitilizeFirst(pokeInfo.name);
    //Add new image
    let imgUrl = pokeInfo.sprites.front_default;
    let image = document.createElement("img");
    image.src = imgUrl;
    image.alt = pokeInfo.name + "sprite";

    document.getElementById("sprites").appendChild(image);

  }

  /**
  *  Updates the statistic information of the pokemon on the page.
  *  @param {Object} pokeInfo All the information saved for the given pokemon.
  */
  function changeStats(pokeInfo) {
    let stats = pokeInfo.stats;
    for (let i = 0; i < stats.length; i++) {
      let singleStat = stats[i];
      let statName = singleStat.stat.name;
      let statValue = singleStat.base_stat;
      document.getElementById(statName).style["width"] = ((statValue / 255) * 100) + "%";
      document.getElementById(statName + "-val").innerText = statValue;
    }
  }

  /**
  *  Capitilizes the first letter of the given string.
  * @param {String} name The string to capitilize.
  * @returns {String} The capitilized string
  */
  function capitilizeFirst(name) {
    return name.slice(0,1).toUpperCase() + name.slice(1);
  }

  /**
  *  Formats the given number to a 3 character representation of the number to fit pokemon style
  * ex: 1 => "001"
  * @param {Number} num The number to be converted to a formatted string
  * @returns {String} The string representation ie "052" etc.
  */
  function formattedNumber(num) {
    let result = "";
    if (num < 10) {
      result = "00" + num;
    } else if (num < 100) {
      result = "0" + num;
    } else {
      result = "" + num;
    }
    return result + " ";
  }

  /**
  *  Sorts the given array.
  * @param {Array} data The array to be sorted.
  * @returns {Array} The sorted array.
  */
  function mergeSortPoke(data) {
    if (data.length === 1) {
      return data;
    }
    let middle = Math.floor(data.length / 2);
    let leftArray = data.slice(0, middle);
    let rightArray = data.slice(middle);
    return merge(leftArray, rightArray);
  }

  /**
  *  Helper recursive function to do the sorting
  * @param {Array} left The left half to be merged.
  * @param {Array} right The right half to be merged.
  * @returns {Array} A sorted array of the 2 halves passed in.
  */
  function merge(left, right) {
    let returnable = [];
    let leftI = 0;
    let rightI = 0;
    while (leftI < left.length && rightI < right.length) {
      if (left[leftI].id < right[rightI].id) {
        returnable.push(left[leftI]);
        leftI++;
      } else {
        returnable.push(right[rightI]);
        rightI++;
      }
      return returnable.concat(left.slice(leftI)).concat(right.slice(rightI));
    }
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} response - response to check for success/error
   * @returns {object} - valid result text if response was successful, otherwise rejected
   *                     Promise result
   */
  function checkStatus(response) { 
    if (response.status >= 200 && response.status < 300 || response.status == 0) {  
      return response.text();
    } else {  
      return Promise.reject(new Error(response.status + ": " + response.statusText)); 
    }
  }

  /**
  *  Displays if a error loading the pokemon was encountered.
  */
  function catchError() {
    document.getElementById("search").placeholder = "Error Loading Pokemon";
  }

})();