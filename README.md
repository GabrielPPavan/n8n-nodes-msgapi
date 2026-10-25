# n8n-nodes-msgapi

Nós do [n8n](https://n8n.io) para o [msg.api](https://msg.api.br): envie e receba mensagens de WhatsApp nos seus fluxos, sem programar.

*n8n community nodes for [msg.api](https://msg.api.br), a WhatsApp API with a fixed price per number. English summary at the end.*

## Instalação

**n8n self-hosted:** em **Settings › Community Nodes › Install**, digite `n8n-nodes-msgapi` e confirme.

Mais detalhes na [documentação do n8n sobre community nodes](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

1. No [painel do msg.api](https://painel.msg.api.br), abra o seu número e copie a **chave de API**.
2. No n8n, crie uma credencial **msg.api API** e cole a chave.
3. Deixe o **API URL** como `https://msg.api.br`.

## Nós

### msg.api Trigger

Inicia o fluxo quando chega uma mensagem no seu número. Ao ativar o fluxo, o nó se cadastra sozinho no msg.api e, ao desativar, se remove. Não é preciso copiar nenhum webhook.

- **Eventos:** mensagem recebida; voto em enquete (com as opções escolhidas); mensagem da fila anti-ban enviada ou com falha.
- **Opções:** ignorar mensagens de grupos e incluir as mensagens enviadas pelo próprio número. Por padrão, elas ficam de fora para evitar respostas em loop.

Cada mensagem recebida chega assim:

```json
{
  "event": "message.received",
  "id": "3EB0C767D82B6A0A1F2E",
  "from": "5567999999999@s.whatsapp.net",
  "chat": "5567999999999@s.whatsapp.net",
  "from_me": false,
  "text": "Olá! Quero saber o preço",
  "media": null
}
```

### msg.api

| Recurso | Operações |
|---|---|
| Message | Send Text, Send File (imagem, vídeo, áudio ou documento, de um arquivo binário ou de um link), Send Poll, React, Mark as Read |
| Contact | Check (quais números têm WhatsApp), Get, Get Profile Picture |
| Group | Get Many, Get, Create, Add Participants |
| Connection | Get Status, Get Profile |
| Anti-Ban | Get, Update (ligar, desligar, limites por minuto, hora e dia, intervalo entre mensagens, horário ativo e aquecimento de número novo) |

Os números vão com DDI e DDD, só dígitos (ex.: `5567999999999`). Grupos usam o ID terminado em `@g.us`.

Com o anti-ban ligado, os textos entram na fila e saem no ritmo de uma pessoa. Para códigos de verificação, ligue **Send Immediately**.

No **Send File**, escolha a origem: um arquivo binário de um nó anterior ou um link https (até 25 MB), que o msg.api baixa. Com **File Type** em *Auto-Detect*, fotos, vídeos e áudios que o WhatsApp exibe vão como mídia, e o resto como documento.

O nó também pode ser usado como ferramenta do **AI Agent**.

Cada voto em enquete chega assim (`options` vazio quando a pessoa tira o voto):

```json
{
  "event": "poll.vote",
  "poll_id": "3EB0A1B2C3D4E5F6A7B8",
  "poll_name": "Quer continuar recebendo?",
  "chat": "5567999999999@s.whatsapp.net",
  "from": "5567999999999@s.whatsapp.net",
  "from_me": false,
  "options": ["Sair"]
}
```

Só dá para ler votos de enquetes enviadas depois que o número foi conectado ao msg.api: é quando o msg.api guarda o código que o WhatsApp usa para cifrar os votos.

## Exemplo: responder automaticamente

1. **msg.api Trigger** com o evento *Message Received*.
2. **msg.api** › Message › Send Text, com `To` = `{{ $json.chat }}` e o texto da resposta.

## English

- **msg.api Trigger:** starts a workflow when a WhatsApp message arrives. It registers and removes its own webhook automatically.
- **msg.api:** sends texts, files (from binary data or an https link) and polls, manages contacts and groups, and turns the anti-ban on, off or adjusts it.
- **Credentials:** the API key of your number, from the msg.api panel.

## Licença

[MIT](LICENSE)
