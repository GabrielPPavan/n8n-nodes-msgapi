import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { antibanDescription } from './resources/antiban';
import { messageDescription } from './resources/message';
import { apiError } from './shared';
import { connectionDescription, contactDescription, groupDescription } from './resources/others';

export class MsgApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'msg.api',
		name: 'msgApi',
		icon: { light: 'file:../../icons/msgapi.svg', dark: 'file:../../icons/msgapi.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send WhatsApp messages, files and polls, manage contacts and groups, and set the anti-ban with msg.api',
		defaults: {
			name: 'msg.api',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'msgApiApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.url}}',
			ignoreHttpStatusErrors: true,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Anti-Ban', value: 'antiban' },
					{ name: 'Connection', value: 'connection' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Group', value: 'group' },
					{ name: 'Message', value: 'message' },
				],
				default: 'message',
				routing: { output: { postReceive: [apiError] } },
			},
			...messageDescription,
			...contactDescription,
			...groupDescription,
			...connectionDescription,
			...antibanDescription,
		],
	};
}
