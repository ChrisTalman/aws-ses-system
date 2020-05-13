declare module '@nathancahill/sns-validator'
{
	export class MessageValidator
	{
		public validate(message: object): Promise<object>;
	}
}