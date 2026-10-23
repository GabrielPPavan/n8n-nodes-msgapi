import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
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
		description: 'Send WhatsApp messages, files and polls, and manage contacts and groups with msg.api',
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
		],
	};
}
