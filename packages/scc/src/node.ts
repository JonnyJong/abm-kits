import { RequestListener } from 'node:http';
import { Http2ServerRequest, Http2ServerResponse } from 'node:http2';
import { ObjCodec } from 'obj-codec';
import { InvocationSchema, ProtocolMap } from './common';

export type Handler<T extends InvocationSchema> = (
	...args: T['args']
) => T['result'] | Promise<T['result']>;

export type HandlerMap<T extends ProtocolMap = ProtocolMap> = {
	[K in keyof T]: Handler<T[K]>;
};

type Request = Parameters<RequestListener>[0] | Http2ServerRequest;
type Response = Parameters<RequestListener>[1] | Http2ServerResponse;

export class StreamBridge<T extends HandlerMap = HandlerMap> {
	codec?: ObjCodec;
	#handlers = new Map<string, Handler<any>>();
	constructor(codec?: ObjCodec, handlers?: T) {
		this.codec = codec;
		if (!handlers) return;
		for (const [name, handler] of Object.entries(handlers)) {
			this.#handlers.set(name, handler);
		}
	}
	async #respond(response: Response, data: any, statusCode = 200) {
		const codec = this.codec ?? ObjCodec;
		const encoder = codec.encode(data);
		const reader = encoder.getStream().getReader();
		response.writeHead(statusCode, {
			'Content-Type': 'application/octet-stream',
			'Access-Control-Allow-Origin': '*',
		});
		while (true) {
			const { done, value } = await reader.read();
			if (value) (response as Http2ServerResponse).write(value);
			if (done) {
				response.end();
				return;
			}
		}
	}
	#receive(request: Request) {
		const codec = this.codec ?? ObjCodec;
		const decoder = codec.decode();
		return new Promise<any>((resolve, reject) => {
			request.on('data', (chunk) => decoder.write(chunk));
			request.on('end', () => resolve(decoder.end()));
			request.on('error', reject);
		});
	}
	async #post(request: Request, response: Response) {
		try {
			const data = await this.#receive(request);
			if (
				typeof data !== 'object' ||
				typeof data.name !== 'string' ||
				!Array.isArray(data.args)
			)
				throw new Error('Invalid request');
			const handler = this.#handlers.get(data.name);
			if (!handler) throw new Error(`No handler for ${data.name}`);
			const result = await handler(...data.args);
			return this.#respond(response, result);
		} catch (error) {
			if (error instanceof Error) {
				return this.#respond(
					response,
					{
						name: error.name,
						message: error.message,
						stack: error.stack,
						cause: error.cause,
					},
					500,
				);
			}
		}
	}
	#preFlight(response: Response) {
		response.writeHead(204, {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': 86400,
		});
		response.end();
		return;
	}
	execute(request: Request, response: Response) {
		if (request.method === 'POST') return this.#post(request, response);
		if (request.method === 'OPTIONS') return this.#preFlight(response);
	}
	handle<K extends keyof T & string>(name: K, handler: T[K]) {
		this.#handlers.set(name, handler);
	}
}

export class Bridge<T extends HandlerMap = HandlerMap> {
	codec?: ObjCodec;
	#handlers = new Map<string, Handler<any>>();
	constructor(codec?: ObjCodec, handlers?: T) {
		this.codec = codec;
		if (!handlers) return;
		for (const [name, handler] of Object.entries(handlers)) {
			this.#handlers.set(name, handler);
		}
	}
	#preFlight(response: Response) {
		response.writeHead(204, {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': 86400,
		});
		response.end();
		return;
	}
	#receive(request: Request) {
		const codec = this.codec ?? ObjCodec;
		const decoder = codec.decode();
		return new Promise<any>((resolve, reject) => {
			request.on('data', (chunk) => decoder.write(chunk));
			request.on('end', () => resolve(decoder.end()));
			request.on('error', reject);
		});
	}
	async #respond(response: Response, data: any, statusCode = 200) {
		const codec = this.codec ?? ObjCodec;
		const encoder = codec.encode(data);
		response.writeHead(statusCode, {
			'Content-Type': 'application/octet-stream',
			'Access-Control-Allow-Origin': '*',
		});
		response.end(await encoder.toBuffer());
	}
	async #post(request: Request, response: Response) {
		try {
			const data = await this.#receive(request);
			if (
				typeof data !== 'object' ||
				typeof data.name !== 'string' ||
				!Array.isArray(data.args)
			)
				throw new Error('Invalid request');
			const handler = this.#handlers.get(data.name);
			if (!handler) throw new Error(`No handler for ${data.name}`);
			const result = await handler(...data.args);
			return this.#respond(response, result);
		} catch (error) {
			if (error instanceof Error) {
				return this.#respond(
					response,
					{
						name: error.name,
						message: error.message,
						stack: error.stack,
						cause: error.cause,
					},
					500,
				);
			}
		}
	}
	execute(request: Request, response: Response) {
		if (request.method === 'POST') return this.#post(request, response);
		if (request.method === 'OPTIONS') return this.#preFlight(response);
	}
	handle<K extends keyof T & string>(name: K, handler: T[K]) {
		this.#handlers.set(name, handler);
	}
}
