let dictionary = [];
const express = require("express");
const fs = require("fs");

var app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

/*CORS isn't enabled on the server, this is due to security reasons by default,
so no one else but the webserver itself can make requests to the server.*/

// Add headers
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

// Osoite: localhost:3000
// Metodi: GET
// Kuvaus: Palauttaa sanakirjan sisällön
// Parametrit: Ei parametreja
// Ongelmia: Vie jokaisella kutsulla sanakirjan sisällön, joka monistuu joka kerta (suorita vain kerran)
app.get("/", (req, res) => {
  const data = fs.readFileSync("./sanakirja.txt", {
    encoding: "utf8",
    flag: "r",
  });
  //data:ssa on nyt koko tiedoston sisältö
  /*tiedoston sisällön pitää pärkiä ja tehd' taulukko*/

  if (data.length === 0) {
    res.json({
      message:
        "No words in the dictionary at the moment. Use /addwords with parameters to add some. Example: /addword?fin=kissa&eng=cat",
    });
    return;
  }

  const splitLines = data.split(/\r?\n/);
  /* Tässä voisi käydä silmukassa läpi splitlinen jokainen rivi*/
  splitLines.forEach((line) => {
    const words = line.split(" "); //sanat taulukkoon words
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

// Osoite: localhost:3000/searchword?fin=<hakusana>
// Metodi: GET
// Kuvaus: Hakee suomenkielisen sanan perusteella englanninkielisen sanan
// Parametrit: fin (suomenkielinen sana)
// Ongelmia: ???
app.get("/searchword", (req, res) => {
  const { fin } = req.query;
  const filteredWords = dictionary.filter((word) => word.fin === fin);
  const englishPair = filteredWords.map((word) => ({ eng: word.eng }));
  res.json(englishPair);
});

// Osoite: localhost:3000/addword?fin=<suomenkielinen sana>&eng=<englanninkielinen sana>
// Metodi: POST
// Kuvaus: Lisää uuden sanaparin sanakirjaan
// Parametrit: fin (suomenkielinen sana), eng (englanninkielinen sana)
// Ongelmia: ???
app.post("/addword", (req, res) => {
  const { fin, eng } = req.query;
  const word = {
    fin,
    eng,
  };

  const existingWord = dictionary.some(
    (word) => (word.fin === fin) & (word.eng === eng)
  );

  if (!existingWord) {
    dictionary.push(word);
    res.json(dictionary);
    fs.writeFileSync("./sanakirja.txt", `\n${fin} ${eng}`, {
      encoding: "utf8",
      flag: "a",
    });
  } else {
    res.json({ message: "Word already exists" });
    res.status(400);
  }
});

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
