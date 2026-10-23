import {
	NodeApiError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type INodeProperties,
	type JsonObject,
} from 'n8n-workflow';

/** The API answers errors in plain text: surface that message instead of a generic one. */
export async function apiError(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	if (response.statusCode < 400) {
		return items;
	}
	const body = response.body as unknown;
	const message =
		typeof body === 'string' && body.trim()
			? body.trim()
			: String((body as IDataObject | undefined)?.error ?? `Request failed with status code ${response.statusCode}`);
	const httpCode = String(response.statusCode);
	throw new NodeApiError(this.getNode(), { message, httpCode } as JsonObject, { message, httpCode });
}

/** Recipient: phone number or group ID. */
export function toField(resource: string, operations: string[]): INodeProperties {
	return {
		displayName: 'To',
		name: 'to',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5567999999999',
		description:
			'Phone number with country and area code, digits only (e.g. 5567999999999), or a group ID ending in @g.us',
		displayOptions: { show: { resource: [resource], operation: operations } },
		routing: { send: { type: 'body', property: 'to' } },
	};
}

/** Comma-separated list → array of trimmed values. */
export const SPLIT_LIST = '={{$value.split(",").map((v) => v.trim()).filter((v) => v)}}';

/** Sends the item's binary file as base64, with its MIME type and file name. */
export async function attachBinary(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const property = this.getNodeParameter('binaryPropertyName') as string;
	const binary = this.helpers.assertBinaryData(property);
	const buffer = await this.helpers.getBinaryDataBuffer(property);
	const body = (requestOptions.body ?? {}) as IDataObject;
	body.data_base64 = buffer.toString('base64');
	body.mimetype = binary.mimeType;
	if (!body.filename && binary.fileName) {
		body.filename = binary.fileName;
	}
	requestOptions.body = body;
	return requestOptions;
}
