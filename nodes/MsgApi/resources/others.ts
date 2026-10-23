import type { INodeProperties } from 'n8n-workflow';
import { SPLIT_LIST } from '../shared';

const numbersField = (resource: string, operations: string[]): INodeProperties => ({
	displayName: 'Phone Numbers',
	name: 'numbers',
	type: 'string',
	required: true,
	default: '',
	placeholder: '5567999999999, 5511988887777',
	description: 'Phone numbers with country and area code, digits only, separated by commas',
	displayOptions: { show: { resource: [resource], operation: operations } },
	routing: { send: { type: 'body', property: 'jids', value: SPLIT_LIST } },
});

const groupIdField = (operations: string[]): INodeProperties => ({
	displayName: 'Group ID',
	name: 'groupId',
	type: 'string',
	required: true,
	default: '',
	placeholder: '120363000000000000@g.us',
	description: 'ID of the group, ending in @g.us (see Group › Get Many)',
	displayOptions: { show: { resource: ['group'], operation: operations } },
	routing: { send: { type: 'body', property: 'jid' } },
});

export const contactDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contact'] } },
		options: [
			{
				name: 'Check',
				value: 'check',
				description: 'Check which phone numbers have WhatsApp',
				action: 'Check phone numbers',
				routing: { request: { method: 'POST', url: '/contact/check' } },
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get public info of contacts',
				action: 'Get contacts',
				routing: { request: { method: 'POST', url: '/contact/info' } },
			},
			{
				name: 'Get Profile Picture',
				value: 'getPicture',
				description: 'Get the profile picture URL of a contact',
				action: 'Get a profile picture',
				routing: { request: { method: 'POST', url: '/contact/profile-picture' } },
			},
		],
		default: 'check',
	},
	numbersField('contact', ['check', 'get']),
	{
		displayName: 'Phone Number',
		name: 'number',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5567999999999',
		displayOptions: { show: { resource: ['contact'], operation: ['getPicture'] } },
		routing: { send: { type: 'body', property: 'jid' } },
	},
];

export const groupDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['group'] } },
		options: [
			{
				name: 'Add Participants',
				value: 'addParticipants',
				description: 'Add people to a group',
				action: 'Add participants to a group',
				routing: { request: { method: 'POST', url: '/group/participants/add' } },
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a group',
				action: 'Create a group',
				routing: { request: { method: 'POST', url: '/group/create' } },
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get name, description and participants of a group',
				action: 'Get a group',
				routing: { request: { method: 'POST', url: '/group/info' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List the groups this number is in',
				action: 'Get many groups',
				routing: {
					request: { method: 'GET', url: '/group/list' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'groups' } }] },
				},
			},
		],
		default: 'getAll',
	},
	groupIdField(['get', 'addParticipants']),
	{
		displayName: 'Name',
		name: 'subject',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['group'], operation: ['create'] } },
		routing: { send: { type: 'body', property: 'subject' } },
	},
	{
		displayName: 'Participants',
		name: 'participants',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5567999999999, 5511988887777',
		description: 'Phone numbers with country and area code, separated by commas',
		displayOptions: { show: { resource: ['group'], operation: ['create', 'addParticipants'] } },
		routing: { send: { type: 'body', property: 'participants', value: SPLIT_LIST } },
	},
];

export const connectionDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['connection'] } },
		options: [
			{
				name: 'Get Profile',
				value: 'getProfile',
				description: 'Get the phone number and name in use',
				action: 'Get the connected profile',
				routing: { request: { method: 'GET', url: '/me' } },
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Check whether WhatsApp is connected',
				action: 'Get the connection status',
				routing: { request: { method: 'GET', url: '/status' } },
			},
		],
		default: 'getStatus',
	},
];
