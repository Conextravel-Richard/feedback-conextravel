const { Client } = require('@notionhq/client');

// Pega as chaves secretas do ambiente de hospedagem
const NOTION_TOKEN = process.env.NOTION_API_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_TOKEN });

exports.handler = async (event) => {
  // Apenas permite requisições do tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // Envia os dados para o Notion
    await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        
        // --- AQUI ESTÁ A CORREÇÃO ---
        // "Nome da Pessoa" agora é a coluna Title
        'Nome da Pessoa': { 
          title: [{ text: { content: data.seuNome || 'Não preenchido' } }] 
        },
        // "Nome da Empresa" agora é uma coluna Rich Text
        'Nome da Empresa': { 
          rich_text: [{ text: { content: data.nomeEmpresa || 'Não preenchido' } }] 
        },
        // --- FIM DA CORREÇÃO ---

        'Satisfação (0-5)': { number: parseInt(data.satisfacaoAtendimento, 10) },
        'Ponto de Destaque': { rich_text: [{ text: { content: data.pontoDestaque || 'Não preenchido' } }] },
        'Ponto de Destaque (Outros)': { rich_text: [{ text: { content: data.pontoDestaqueOutros || 'N/A' } }] },
        'Conhece Dept. Eventos': { rich_text: [{ text: { content: data.conheceEventos || 'Nenhuma opção marcada' } }] },
        'Comentários': { rich_text: [{ text: { content: data.comentarios || 'Nenhum comentário' } }] },
        'Data de Envio': { date: { start: new Date().toISOString() } },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Feedback salvo com sucesso!' }),
    };
  } catch (error) {
    console.error('ERRO AO SALVAR NO NOTION:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro interno ao salvar no Notion.' }),
    };
  }
};