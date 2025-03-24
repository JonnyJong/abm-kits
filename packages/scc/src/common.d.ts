export interface InvocationSchema<Args extends any[] = any[], Result = any> {
	args: Args;
	result: Result;
}

export interface ProtocolMap {
	[name: string]: InvocationSchema;
}
