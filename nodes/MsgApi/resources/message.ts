import type { INodeProperties } from 'n8n-workflow';
import { attachBinary, toField } from '../shared';

const show = (operation: string[]) => ({ show: { resource: ['message'], operation } });

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['message'] } },
		options: [
			{
				name: 'Mark as Read',
				value: 'markRead',
				description: 'Mark messages of a chat as read',
				action: 'Mark messages as read',
				routing: { request: { method: 'POST', url: '/message/mark-read' } },
			},
			{
				name: 'React',
				value: 'react',
				description: 'React to a message with an emoji',
				action: 'React to a message',
				routing: { request: { method: 'POST', url: '/message/send-reaction' } },
			},
			{
				name: 'Send File',
				value: 'sendMedia',
				description: 'Send an image, video, audio or document',
				action: 'Send a file',
				routing: { request: { method: 'POST', url: '/message/send-media' } },
			},
			{
				name: 'Send Poll',
				value: 'sendPoll',
				description: 'Send a poll',
				action: 'Send a poll',
				routing: { request: { method: 'POST', url: '/poll/create' } },
			},
			{
				name: 'Send Text',
				value: 'sendText',
				description: 'Send a text message',
				action: 'Send a text message',
				routing: { request: { method: 'POST', url: '/message/send-text' } },
			},
		],
		default: 'sendText',
	},

	// ----- Send Text
	toField('message', ['sendText', 'sendMedia', 'sendPoll', 'react']),
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		description: 'Message text. Supports *bold*, _italic_ and emojis.',
		displayOptions: show(['sendText']),
		routing: { send: { type: 'body', property: 'text' } },
	},
	{
		displayName: 'Send Immediately',
		name: 'urgent',
		type: 'boolean',
		default: false,
		description:
			'Whether to skip the anti-ban queue and send right away. Use only for one-time codes and other urgent messages.',
		displayOptions: show(['sendText']),
		routing: { send: { type: 'body', property: 'urgent' } },
	},

	// ----- Send File
	{
		displayName: 'File Type',
		name: 'mediaType',
		type: 'options',
		options: [
			{ name: 'Audio', value: 'audio' },
			{ name: 'Document', value: 'document' },
			{ name: 'Image', value: 'image' },
			{ name: 'Video', value: 'video' },
		],
		default: 'image',
		displayOptions: show(['sendMedia']),
		routing: { send: { type: 'body', property: 'type' } },
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		hint: 'The name of the input binary field containing the file to send',
		displayOptions: show(['sendMedia']),
		routing: { send: { preSend: [attachBinary] } },
	},
	{
		displayName: 'Caption',
		name: 'caption',
		type: 'string',
		default: '',
		displayOptions: show(['sendMedia']),
		routing: { send: { type: 'body', property: 'caption' } },
	},
	{
		displayName: 'File Name',
		name: 'filename',
		type: 'string',
		default: '',
		description: 'Name shown for documents. Defaults to the binary file name.',
		displayOptions: show(['sendMedia']),
		routing: { send: { type: 'body', property: 'filename' } },
	},

	// ----- Send Poll
	{
		displayName: 'Question',
		name: 'question',
		type: 'string',
		required: true,
		default: '',
		displayOptions: show(['sendPoll']),
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Options',
		name: 'pollOptions',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Option',
		required: true,
		default: {},
		displayOptions: show(['sendPoll']),
		options: [
			{
				name: 'values',
				displayName: 'Option',
				values: [{ displayName: 'Text', name: 'text', type: 'string', default: '' }],
			},
		],
		routing: {
			send: {
				type: 'body',
				property: 'options',
				value: '={{($value.values || []).map((o) => o.text)}}',
			},
		},
	},
	{
		displayName: 'Max Choices',
		name: 'maxChoices',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'How many options each person can pick',
		displayOptions: show(['sendPoll']),
		routing: { send: { type: 'body', property: 'selectable_count' } },
	},

	// ----- React
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the message, as received by the msg.api Trigger',
		displayOptions: show(['react']),
		routing: { send: { type: 'body', property: 'message_id' } },
	},
	{
		displayName: 'Emoji',
		name: 'emoji',
		type: 'string',
		required: true,
		default: '👍',
		description: 'Emoji to react with. Leave empty to remove the reaction.',
		displayOptions: show(['react']),
		routing: { send: { type: 'body', property: 'emoji' } },
	},
	{
		displayName: 'Message Was Sent by Me',
		name: 'fromMe',
		type: 'boolean',
		default: false,
		description: 'Whether the message being reacted to was sent by this number',
		displayOptions: show(['react']),
		routing: { send: { type: 'body', property: 'from_me' } },
	},

	// ----- Mark as Read
	{
		displayName: 'Chat',
		name: 'chat',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5567999999999',
		description: 'Phone number or group ID of the chat',
		displayOptions: show(['markRead']),
		routing: { send: { type: 'body', property: 'chat' } },
	},
	{
		displayName: 'Message IDs',
		name: 'messageIds',
		type: 'string',
		required: true,
		default: '',
		description: 'IDs of the messages to mark as read, separated by commas',
		displayOptions: show(['markRead']),
		routing: {
			send: {
				type: 'body',
				property: 'message_ids',
				value: '={{$value.split(",").map((v) => v.trim()).filter((v) => v)}}',
			},
		},
	},
];
