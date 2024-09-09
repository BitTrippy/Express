let dictionary = [];
const express = require("express");
const fs = require("fs");

var app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  res.setHeader("Content-type", "application/json");

  // Pass to next layer of middleware
  next();
});

// Osoite: localhost:3000/words
// Metodi: GET
// Kuvaus: Palauttaa sanakirjan sisällön sanakirja.txt-tiedostosta
// Parametrit: Ei parametreja
// Ongelmia: Vie jokaisella kutsulla sanakirjan sisällön, joka monistuu joka kerta (suorita vain kerran)
app.get("/words", (req, res) => {
  const data = fs.readFileSync("./sanakirja.txt", {
    encoding: "utf8",
    flag: "r",
  });

  // Tarkistetaan onko sanakirjassa sanoja
  if (data.length === 0) {
    res.json({
      message:
        "No words in the dictionary at the moment. Use /words/add with parameters to add some. Example: /words/add?fin=kissa&eng=cat",
    });
    return;
  }

  const splitLines = data.split(/\r?\n/);
  splitLines.forEach((line) => {
    const words = line.split(" ");
    console.log(words);
    const word = {
      fin: words[0],
      eng: words[1],
    };
    dictionary.push(word);
    console.log(dictionary);
  });

  res.json(dictionary);
});

// Osoite: localhost:3000/words/search?fin=<hakusana>
// Metodi: GET
// Kuvaus: Hakee suomenkielisen sanan perusteella englanninkielisen vastineen
// Parametrit: fin (suomenkielinen sana)
app.get("/words/search", (req, res) => {
  const { fin } = req.query;
  const filteredWords = dictionary.filter((word) => word.fin === fin);
  const englishPair = filteredWords.map((word) => ({ eng: word.eng }));

  // Tarkistetaan onko sana löytynyt
  if (filteredWords.length > 0) {
    res.json(englishPair);
  } else {
    res.json({ message: "Word not found" });
  }
});

// Osoite: localhost:3000/words/add?fin=<suomenkielinen sana>&eng=<englanninkielinen sana>
// Metodi: POST
// Kuvaus: Lisää uuden sanaparin sanakirjaan
// Parametrit: fin (suomenkielinen sana), eng (englanninkielinen sana)
app.post("/words/add", (req, res) => {
  const { fin, eng } = req.query;
  const word = {
    fin,
    eng,
  };

  // Tarkistetaan onko sana jo olemassa vertaamalla fin ja eng parametreja dictionary-taulukon arvoihin
  const existingWord = dictionary.some(
    (word) => (word.fin === fin) & (word.eng === eng)
  );

  // Jos sanaa ei löydy, lisätään se dictionary-taulukkoon ja sanakirja.txt-tiedostoon
  if (!existingWord) {
    dictionary.push(word);
    res.json(dictionary);
    fs.writeFileSync("./sanakirja.txt", `\n${fin} ${eng}`, {
      encoding: "utf8",
      flag: "a",
    });
  } else {
    res.json({ message: "Word already exists" });
  }
});

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
