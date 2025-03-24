export interface ExpressionEvaluationResult {
	value: number;
	text: string;
	error?: string;
}
export interface IExpressionEvaluator {
	evaluate(expression: string): ExpressionEvaluationResult;
}
