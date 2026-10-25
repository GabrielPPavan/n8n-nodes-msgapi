import {
	NodeApiError,
	NodeConnectionTypes,
	type IDataObject,
	type IHookFunctions,
	type IHttpRequestMethods,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
	type JsonObject,
} from 'n8n-workflow';

interface Subscription {
	id: string;
	url: string;
}

/** Calls the msg.api webhooks API with the node credentials. */
async function webhooksApi(
	this: IHookFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('msgApiApi');
	const baseUrl = String(credentials.url ?? 'https://msg.api.br').replace(/\/+$/, '');
	return (await this.helpers.httpRequestWithAuthentication.call(this, 'msgApiApi', {
		method,
		url: `${baseUrl}${path}`,
		body,
		json: true,
	})) as IDataObject;
}

export class MsgApiTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'msg.api Trigger',
		name: 'msgApiTrigger',
		icon: { light: 'file:../../icons/msgapi.svg', dark: 'file:../../icons/msgapi.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when a WhatsApp message arrives on your msg.api number',
		defaults: {
			name: 'msg.api Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'msgApiApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				options: [
					{
						name: 'Message Failed',
						value: 'message.failed',
						description: 'A message waiting in the anti-ban queue could not be sent',
					},
					{
						name: 'Message Received',
						value: 'message.received',
						description: 'A new message arrived in a chat or group',
					},
					{
						name: 'Message Sent',
						value: 'message.sent',
						description: 'A message waiting in the anti-ban queue was sent',
					},
					{
						name: 'Poll Vote',
						value: 'poll.vote',
						description: 'Someone voted in a poll sent by this number, with the chosen options',
					},
				],
				default: ['message.received'],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Ignore Group Messages',
						name: 'ignoreGroups',
						type: 'boolean',
						default: false,
						description: 'Whether to ignore messages sent in groups',
					},
					{
						displayName: 'Include Messages Sent by Me',
						name: 'includeFromMe',
						type: 'boolean',
						default: false,
						description:
							'Whether to also trigger on messages sent by this number (e.g. from the phone). Off by default to avoid reply loops.',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const url = this.getNodeWebhookUrl('default');
				const data = this.getWorkflowStaticData('node');
				const res = await webhooksApi.call(this, 'GET', '/webhooks');
				const found = ((res.webhooks as Subscription[]) ?? []).find((w) => w.url === url);
				if (!found) {
					delete data.webhookId;
					return false;
				}
				data.webhookId = found.id;
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const url = this.getNodeWebhookUrl('default');
				const res = await webhooksApi.call(this, 'POST', '/webhooks', { url });
				const webhook = res.webhook as Subscription | undefined;
				if (!webhook?.id) {
					return false;
				}
				this.getWorkflowStaticData('node').webhookId = webhook.id;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (data.webhookId) {
					try {
						await webhooksApi.call(this, 'DELETE', `/webhooks/${data.webhookId as string}`);
					} catch (error) {
						// 404 = already removed on the msg.api side; anything else must surface
						const e = error as { httpCode?: string; response?: { status?: number } };
						if (String(e.httpCode ?? e.response?.status) !== '404') {
							throw new NodeApiError(this.getNode(), error as JsonObject);
						}
					}
					delete data.webhookId;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const events = this.getNodeParameter('events', []) as string[];
		const options = this.getNodeParameter('options', {}) as {
			ignoreGroups?: boolean;
			includeFromMe?: boolean;
		};
		const event = typeof body.event === 'string' ? body.event : 'message.received';
		const chat = typeof body.chat === 'string' ? body.chat : '';

		const skip =
			!events.includes(event) ||
			((event === 'message.received' || event === 'poll.vote') && body.from_me === true && !options.includeFromMe) ||
			(options.ignoreGroups === true && chat.endsWith('@g.us'));
		if (skip) {
			return {};
		}
		return {
			workflowData: [this.helpers.returnJsonArray({ ...body, event })],
		};
	}
}
