let statesData = [];
let trieTimes = [];
let trieCount = 0;

async function fetchData() {
  try {
    const response = await fetch("data.json");
    const jsonData = await response.json();
    statesData = jsonData.states;
    console.log("Data loaded successfully:", statesData);
    let cityCount = 0;
    for (const state of statesData) {
      cityCount += state.cities.length;
    }
    const cityCountElement = document.getElementById("city-count");
    cityCountElement.textContent = `Total Cities/Data: ${cityCount}`;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) {
        return [];
      }
      node = node.children[char];
    }
    return this.collectAllWords(node, prefix);
  }

  collectAllWords(node, prefix) {
    let words = [];
    if (node.isEndOfWord) {
      words.push(prefix);
    }
    for (const char in node.children) {
      words = words.concat(
        this.collectAllWords(node.children[char], prefix + char)
      );
    }
    return words;
  }
}

const trie = new Trie();

function initializeTrie() {
  for (const state of statesData) {
    for (const city of state.cities) {
      trie.insert(city.toLowerCase());
    }
  }
}

function autocomplete() {
  const input = document
    .getElementById("autocomplete-input")
    .value.toLowerCase();
  const suggestions = [];
  const timeTakenElement = document.getElementById("time-taken");

  if (input === "") {
    displaySuggestions(suggestions);
    timeTakenElement.textContent = "";
    return;
  }

  let startTime = performance.now();
  trieCount++;
  suggestions.push(...trie.startsWith(input));
  let endTime = performance.now();

  let timeTaken = endTime - startTime;
  trieTimes.push(timeTaken);

  const averageTime = calculateAverage(trieTimes);

  console.log(
    `Trie, Time taken: ${timeTaken.toFixed(
      2
    )} ms, Average Time: ${averageTime} ms`
  );

  timeTakenElement.textContent = `Time taken: ${timeTaken.toFixed(
    2
  )} ms, Average Time: ${averageTime} `;

  displaySuggestions(suggestions);
}

function calculateAverage(times) {
  if (times.length === 0) return "Not used yet";
  const sum = times.reduce((acc, curr) => acc + curr, 0);
  const average = sum / times.length;
  return average.toFixed(2) + " ms";
}

window.autocomplete = autocomplete;

function displaySuggestions(suggestions) {
  const suggestionsList = document.getElementById("suggestions");
  suggestionsList.innerHTML = "";
  for (const suggestion of suggestions) {
    const listItem = document.createElement("li");
    listItem.textContent = suggestion;
    suggestionsList.appendChild(listItem);
  }
}

setTimeout(() => {
  initializeTrie();
}, 1000);

function resetStats() {
  trieTimes = [];
  trieCount = 0;
  document.getElementById("trie-average").textContent = "Not used yet";
}

window.resetStats = resetStats;
