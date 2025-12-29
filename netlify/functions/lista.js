const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  try {
    const filePath = path.resolve(__dirname, "lista.txt");
    const data = fs.readFileSync(filePath, "utf8");

    const linhas = data.split("\n");
    const todosCanais = [];

    // 1. Organiza os dados do arquivo 
    for (let i = 0; i < linhas.length; i++) {
      if (linhas[i].startsWith("#EXTINF:")) {
        const nome = linhas[i].split(",").pop().trim();
        const url = linhas[i + 1] ? linhas[i + 1].trim() : "";

        if (nome && url) {
          todosCanais.push({ nome, url });
        }
      }
    }

    const resultados = todosCanais;

    // Formata como M3U
    let m3uContent = "#EXTM3U\n";
    resultados.forEach((canal) => {
      m3uContent += `#EXTINF:-1, ${canal.nome}\n`;
      m3uContent += `${canal.url}\n`;
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*"
      },
      body: m3uContent
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};