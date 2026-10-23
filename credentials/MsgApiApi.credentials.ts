import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MsgApiApi implements ICredentialType {
	name = 'msgApiApi';

	displayName = 'msg.api API';

	icon: Icon = { light: 'file:../icons/msgapi.svg', dark: 'file:../icons/msgapi.dark.svg' };

	documentationUrl = 'https://github.com/GabrielPPavan/n8n-nodes-msgapi#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Key of the WhatsApp number, shown in the msg.api panel on the number page',
		},
		{
			displayName: 'API URL',
			name: 'url',
			type: 'string',
			default: 'https://msg.api.br',
			description: 'Address of the msg.api API. Keep the default unless you run your own server.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				apikey: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/webhooks',
			method: 'GET',
		},
	};
}
