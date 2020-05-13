declare module '@nathancahill/sns-validator'
{
	export default class MessageValidator
	{
		public validate(message: object): Promise<object>;
	}
}