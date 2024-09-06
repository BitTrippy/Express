const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

let dictionary = [];

// Read the dictionary from the file on server start
const data = fs.readFileSync("./sanakirja.txt", "utf8");
const splitLines = data.split(/\r?\n/);
splitLines.forEach((line) => {
  const words = line.split(" ");
  if (words.length === 2) {
    const word = {
      fin: words[0],
      eng: words[1],
    };
    dictionary.push(word);
  }
});

// POST method to add words
app.post("/addword", (req, res) => {
  const { fin, eng } = req.query;
  const word = { fin, eng };

  const existingWord = dictionary.some(
    (word) => word.fin === fin && word.eng === eng
  );

  if (!existingWord) {
    dictionary.push(word);
    res.json(dictionary);
    fs.writeFileSync("./sanakirja.txt", `\n${fin} ${eng}`, {
      encoding: "utf8",
      flag: "a",
    });
  } else {
    res.status(400).json({ message: "Word already exists" });
  }
});

// GET method to retrieve words
app.get("/words", (req, res) => {
  res.json(dictionary);
});

// GET method to search for a word
app.get("/searchword", (req, res) => {
  const { fin } = req.query;
  const filteredWords = dictionary.filter((word) => word.fin === fin);
  const englishPair = filteredWords.map((word) => ({
    eng: word.eng,
  }));
  res.json(englishPair);
});

app.listen(3000, () => {
  console.log("Server listening at port 3000");
});
