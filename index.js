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

// Osoite: localhost:3000/words/search/<suomenkielinen sana>
// Metodi: GET
// Kuvaus: Hakee suomenkielisen sanan perusteella englanninkielisen vastineen
app.get("/words/search/:word", (req, res) => {
  // Muuttaa hakusanan pieniksi kirjaimisi
  const finnishWord = req.params.word.toLowerCase();

  // Luetaan sanakirja.txt-tiedoston sisältö
  const readData = fs.readFileSync("./sanakirja.txt", {
    encoding: "utf8",
    flag: "r",
  });

  // Jokaisesta tiedoston rivista luodaan sanapari sanakirja listaan
  const splitLines = readData.split(/\r?\n/);

  // Käytetään map-metodia rivien läpikäyntiin ja sanojen erottamiseen. Palauttaa objektin, jossa suomalainen ja englanninkielinen sana
  const filteredWords = splitLines
    .map((line) => {
      // Völilyönti toimii erottimena sanojen välissä
      const words = line.split(" ");
      return {
        fin: words[0],
        eng: words[1],
      };
    })
    // Käytetään filteriä suodattamaan vain hakua vastaavat sanat
    .filter((word) => word.fin === finnishWord);

  const englishPair = filteredWords.map((word) => ({ eng: word.eng }));

  // Jos sana löytyy, palautetaan englanninkielinen pari
  if (filteredWords.length > 0) {
    // Palautetaan löytynyt sana (palautuu stringinä, voin vaihtaa JSON-muotoon tarpeen mukaan)
    res.json(englishPair);
  } else {
    res.json({ message: "Word not found" });
  }
});

// Osoite: localhost:3000/words/add
// Metodi: POST
// Kuvaus: Lisää uuden sanaparin sanakirjaan body parametreina annettujen sanojen perusteella
// Parametrit: fin (suomenkielinen sana), eng (englanninkielinen sana)
app.post("/words/add", (req, res) => {
  const { fin, eng } = req.body;
  const word = {
    fin,
    eng,
  };

  // Tarkistetaan onko sana jo olemassa vertaamalla fin ja eng parametreja dictionary-taulukon arvoihin
  const existingWord = dictionary.some(
    // Tarkistetaan löytyykö suomalainen tai englanninkielinen sana jo sanakirjasta
    (word) => word.fin === fin || word.eng === eng
  );

  // Jos sanaa ei löydy, lisätään se dictionary-taulukkoon ja sanakirja.txt-tiedostoon
  if (!existingWord) {
    dictionary.push(word);
    res.json(dictionary);

    // Vaihdettu appendFileSync-metodiin, joka lisää tiedoston loppuun uuden sanaparin
    fs.appendFileSync("./sanakirja.txt", `\n${fin} ${eng}`, {
      encoding: "utf8",
    });
  } else {
    res.json({ message: "Word already exists" });
  }
});

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
