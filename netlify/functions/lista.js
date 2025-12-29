const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  try {
    const filePath = path.join(process.cwd(), "lista.txt");
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

    // 2. Testa quais canais estão funcionando (Status Check)
    // Nota: Testar todos de uma vez pode ser lento. Aqui testamos os primeiros 10 para exemplo.
    const resultados = await Promise.all(
      todosCanais.map(async (canal) => {
        try {
          // Faz uma requisição rápida (timeout de 2 segundos) para ver se o link responde
          const response = await fetch(canal.url, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
          return { 
            ...canal, 
            status: response.ok ? "Online" : "Offline" 
          };
        } catch (err) {
          return { ...canal, status: "Offline" };
        }
      })
    );

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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao processar lista" })
    };
  }
};