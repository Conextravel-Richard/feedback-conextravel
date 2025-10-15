require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client } = require('@notionhq/client');

const app = express();
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Middlewares
app.use(cors());
app.use(express.json());

// AQUI ESTÁ A CORREÇÃO:
// Instruímos o Express a servir todos os arquivos estáticos (HTML, CSS, JS, Imagens)
// que estão dentro da pasta "Public".
app.use(express.static(path.join(__dirname, 'Public')));

// ROTA DE ENVIO DO FORMULÁRIO (Esta parte já estava correta)
app.post('/api/submit-form', async (req, res) => {
  try {
    const {
      nomeEmpresa,
      satisfacaoAtendimento,
      pontoDestaque,
      pontoDestaqueOutros,
      conheceEventos,
      comentarios,
    } = req.body;

    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        'Nome da Empresa': { title: [{ text: { content: nomeEmpresa } }] },
        'Satisfação (0-5)': { number: parseInt(satisfacaoAtendimento, 10) },
        'Ponto de Destaque': { rich_text: [{ text: { content: pontoDestaque || 'Não preenchido' } }] },
        'Ponto de Destaque (Outros)': { rich_text: [{ text: { content: pontoDestaqueOutros || 'N/A' } }] },
        'Conhece Dept. Eventos': { rich_text: [{ text: { content: conheceEventos || 'Não preenchido' } }] },
        'Comentários': { rich_text: [{ text: { content: comentarios || 'Nenhum comentário' } }] },
        'Data de Envio': { date: { start: new Date().toISOString() } },
      },
    });

    res.status(200).json({ message: 'Feedback salvo com sucesso!' });
  } catch (error) {
    console.error('ERRO AO SALVAR NO NOTION:', error.body || error);
    res.status(500).json({ message: 'Erro interno ao salvar no Notion.' });
  }
});

// INICIA O SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});