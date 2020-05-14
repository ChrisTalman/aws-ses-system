declare module '@chris-talman/aws-ses-system'
{
	// Types
	import { PartialDeep } from '@chris-talman/types-helpers';
	import { SendMailOptions as BaseSendMailOptions } from 'nodemailer';
	import { Address as SendMailOptionsAddress } from 'nodemailer/lib/mailer';

	// Class
	export class EmailSystem <GenericMetadata extends EmailBaseMetadata, GenericLockId = void, GenericEmailHandlerType extends string | undefined = undefined>
	{
		public readonly callbacks: Callbacks <GenericMetadata, GenericLockId, any>;
		public readonly webhookHandlers?: WebhookHandlers <GenericMetadata, GenericLockId, GenericEmailHandlerType>;
		public readonly email: EmailOptions;
		public readonly aws: Aws;
		public readonly queueItemTimeout?: number;
		constructor(parameters: Pick<EmailSystem<GenericMetadata, GenericLockId>, 'callbacks' | 'webhookHandlers' | 'email' | 'aws' | 'queueItemTimeout'>);
		public send
			<GenericEmailSystem extends EmailSystem <GenericMetadata, GenericLockId, GenericEmailHandlerType>, GenericMetadata extends EmailBaseMetadata, GenericLockId>
			(parameters: { email: CustomSendMailOptions, metadata: GenericMetadata, lockId?: GenericLockId, useQueue?: boolean, emailId?: string }):
			Promise<void>;
		public webhook <GenericEmailSystem extends EmailSystem <GenericMetadata, GenericLockId, GenericEmailHandlerType>> (this: GenericEmailSystem, parameters: {message: Message}): Promise<void>;
	}

	// Class Properties
	interface EmailOptions
	{
		from: string;
		fromName: string;
	}
	interface Aws
	{
		ses: AwsSes;
		sns?: AwsSns;
	}
	interface AwsSes
	{
		accessKeyId: string;
		secretAccessKey: string;
		configurationSet: string;
		version?: string;
		rateLimits: AwsSesRateLimits;
	}
	interface AwsSesRateLimits
	{
		day: number;
		second: number;
	}
	interface AwsSns
	{
		version?: string;
	}

	// Callbacks
	interface Callbacks <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType extends string | undefined>
	{
		isLocked: ({id}: {id: GenericLockId}) => Promise<boolean>;
		isUnwanted: ({recipient}: {recipient: string}) => Promise<boolean>;
		insertEmail: ({id, email}: {id?: string, email: Omit<Email<GenericMetadata, GenericLockId>, 'id'>}) => Promise<Email<GenericMetadata, GenericLockId>>;
		updateEmail: ({id, update}: {id: string, update: PartialDeep<Email<GenericMetadata, GenericLockId>>}) => Promise<Email<GenericMetadata, GenericLockId>>;
		consumeRateLimit: () => Promise<boolean>;
		insertLock: ({id, emailId}: {id: GenericLockId, emailId: string}) => Promise<void>;
		deleteLock: ({id}: {id: GenericLockId}) => Promise<void>;
		resolveEmailHandlerType: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => GenericEmailHandlerType;
	}

	// Webhook Handlers
	type WebhookHandlers <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType extends string | undefined> =
		GenericEmailHandlerType extends string
		?
			{
				[Type in GenericEmailHandlerType]: (({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<void>) | null;
			}
		:
			undefined
	;

	// Email
	export interface Email <GenericMetadata extends EmailBaseMetadata, GenericLockId>
	{
		id: string;
		/** Unix milliseconds at which the email was queued for sending. */
		queued?: number;
		recipient: string;
		bounce?: EmailBounce;
		complaint?: EmailComplaint;
		delivery?: EmailDelivery;
		metadata: GenericMetadata;
		/** Indicates whether a bounce or complaint is acceptable and should be included in considerations about sending future emails to the same address. */
		forgiven?: boolean;
		lockId?: GenericLockId;
	}
	export interface EmailBounce
	{
		id: string;
		bounceType: string;
		bounceSubType: string;
		/** Unix milliseconds. */
		timestamp: number;
	}
	export interface EmailComplaint
	{
		id: string;
		/** Unix milliseconds. */
		timestamp: number;
	}
	export interface EmailDelivery
	{
		/** Unix milliseconds. */
		timestamp: number;
	}
	export type EmailBaseMetadata = object;

	// Send Properties
	export interface SendMailOptions extends Required<Pick<BaseSendMailOptions, 'to' | 'from' | 'subject' | 'text' | 'html'>>, Pick<BaseSendMailOptions, 'headers'>
	{
		to: string | SendMailOptionsAddress;
		ses: SendMailOptionsSes;
		/** Callback to run before email is sent. If it throws an exception, the email will not be sent. */
		pre?: () => Promise<void>;
	}
	interface SendMailOptionsSes
	{
		ConfigurationSetName: string;
		Tags: SendMailOptionsSesTags;
	}
	interface SendMailOptionsSesTags extends Array<{Name: string, Value: string}> {}
	export interface CustomSendMailOptions extends Required<Pick<SendMailOptions, 'to' | 'subject' | 'text' | 'html'>>, Pick<BaseSendMailOptions, 'headers'>
	{
		from?: string | Partial<SendMailOptionsAddress>;
	}

	// Webhook Properties
	export type Message = SubscriptionMessage | NotificationMessage;
	export interface BaseMessage
	{
		MessageId: string;
		Type: MessageType;
		Timestamp: string;
		SignatureVersion: string;
		Signature: string;
		SigningCertURL: string;
		TopicArn: string;
		Message: string;
	}
	export type MessageType = 'SubscriptionConfirmation' | 'UnsubscribeConfirmation' | 'Notification';
	export interface SubscriptionMessage extends BaseMessage
	{
		Type: SubscriptionMessageType;
	    SubscribeURL: string;
	    Token: string;
	}
	export type SubscriptionMessageType = 'SubscriptionConfirmation' | 'UnsubscribeConfirmation';
	export interface NotificationMessage extends BaseMessage
	{
		Subject: string;
	}
}