# Changelog

## 0.3.0

- Send Text e Send File: novo campo *Reply To Message* para responder citando uma mensagem (id, from, from_me e text, como vêm do gatilho).
- msg.api Trigger: novos eventos Message Status (entregue, lida, ouvida), Message Reaction, Message Edited, Message Deleted, Connection Update, History Sync e Contacts Update; Message Sent passa a valer para todo envio pela API.
- Mensagens do próprio número (reações, edições e exclusões também) continuam ignoradas, a menos que *Include From Me* esteja ligado.

## 0.2.0

- Send File: o arquivo pode vir de um link https, além do binário; tipo detectado automaticamente (*Auto-Detect*).
- Novo recurso Anti-Ban: Get e Update (ligar, desligar, limites, intervalo, horário ativo e aquecimento).
- msg.api Trigger: novo evento Poll Vote, com as opções escolhidas em enquetes enviadas pelo número.

## 0.1.0

- msg.api: enviar texto, arquivo, enquete, reação e marcar como lida; contatos, grupos e conexão.
- msg.api Trigger: mensagem recebida e eventos da fila anti-ban, com cadastro automático do webhook.
