import { ObjCodec } from 'obj-codec';
import { ProtocolMap } from './common';

declare global {
	interface RequestInit {
		duplex?: 'half' | 'full';
	}
}

export class StreamBridge<T extends ProtocolMap = ProtocolMap> {
	url: string;
	codec?: ObjCodec;
	constructor(url: string, codec?: ObjCodec) {
		this.url = url;
		this.codec = codec;
	}
	#encode(root: any) {
		const codec = this.codec ?? ObjCodec;
		return codec.encode(root).getStream().getReader();
	}
	async #decode(
		reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
	) {
		const codec = this.codec ?? ObjCodec;
		const decoder = codec.decode();
		while (true) {
			const { done, value } = await reader.read();
			if (value) decoder.write(value);
			if (done) return decoder.end();
		}
	}
	async invoke<K extends keyof T>(
		name: K,
		...args: T[K]['args']
	): Promise<T[K]['result'] | Error> {
		try {
			// Send
			const response = await fetch(this.url, {
				method: 'POST',
				body: new ReadableStream(this.#encode({ name, args })),
				headers: { 'Content-Type': 'application/octet-stream' },
				duplex: 'half',
			});
			// Receive
			const result = await this.#decode(response.body!.getReader());
			if (response.status === 200) return result;
			return new Error(result.message, {
				cause: { response: result, code: response.status },
			});
		} catch (error) {
			console.error(error);
			if (error instanceof Error) return error;
			const err = new Error('Unknown error', { cause: error });
			return err;
		}
	}
}

export class Bridge<T extends ProtocolMap = ProtocolMap> {
	url: string;
	codec?: ObjCodec;
	constructor(url: string, codec?: ObjCodec) {
		this.url = url;
		this.codec = codec;
	}
	#encode(root: any) {
		const codec = this.codec ?? ObjCodec;
		return codec.encode(root).toBuffer();
	}
	async #decode(response: Response) {
		const codec = this.codec ?? ObjCodec;
		return codec.decode().decode(await response.arrayBuffer());
	}
	async invoke<K extends keyof T>(
		name: K,
		...args: T[K]['args']
	): Promise<T[K]['result'] | Error> {
		try {
			// Send
			const response = await fetch(this.url, {
				method: 'POST',
				body: new Blob([await this.#encode({ name, args })], {
					type: 'application/octet-stream',
				}),
				headers: { 'Content-Type': 'application/octet-stream' },
			});
			// Receive
			const result = await this.#decode(response);
			if (response.status === 200) return result;
			return new Error(result.message, {
				cause: { response: result, code: response.status },
			});
		} catch (error) {
			console.error(error);
			if (error instanceof Error) return error;
			const err = new Error('Unknown error', { cause: error });
			return err;
		}
	}
}
