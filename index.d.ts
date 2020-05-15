declare module '@chris-talman/aws-ses-system'
{
	// Types
	import { PartialDeep } from '@chris-talman/types-helpers';
	import { SendMailOptions as BaseSendMailOptions } from 'nodemailer';
	import { Address as SendMailOptionsAddress } from 'nodemailer/lib/mailer';

	// Class
	export class EmailSystem <GenericMetadata extends EmailBaseMetadata, GenericLockId = void, GenericEmailHandlerType extends string | void = void>
	{
		public readonly callbacks: Callbacks <GenericMetadata, GenericLockId, any>;
		public readonly webhookHandlers: WebhookHandlers <GenericMetadata, GenericLockId, GenericEmailHandlerType>;
		public readonly email: EmailOptions;
		public readonly aws: Aws;
		public readonly queueItemTimeout?: number;
		constructor(parameters: Pick<EmailSystem<GenericMetadata, GenericLockId, GenericEmailHandlerType>, 'callbacks' | 'webhookHandlers' | 'email' | 'aws' | 'queueItemTimeout'>);
		public send(parameters: {email: CustomSendMailOptions, metadata: GenericMetadata, lockId?: GenericLockId, useQueue?: boolean, emailId?: string}): Promise<void>;
		public webhook(parameters: {message: Message}): Promise<void>;
	}

	// Class Properties
	export interface EmailOptions
	{
		from: EmailOptionsFrom;
	}
	export interface EmailOptionsFrom
	{
		name: string;
		address: string;
	}
	export interface Aws
	{
		ses: AwsSes;
		sns?: AwsSns;
	}
	export interface AwsSes
	{
		accessKeyId: string;
		secretAccessKey: string;
		region: string;
		configurationSet: string;
		version?: string;
		rateLimits: AwsSesRateLimits;
	}
	export interface AwsSesRateLimits
	{
		day: number;
		second: number;
	}
	export interface AwsSns
	{
		version?: string;
	}

	// Callbacks
	export interface Callbacks <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType>
	{
		/** Determines whether email is unwanted by recipient, according to historical bounces or complaints. */
		isUnwanted: ({recipient}: {recipient: string}) => Promise<boolean>;
		/** Determines whether the email is locked, according to its lock ID. */
		isLocked: ({id}: {id: GenericLockId}) => Promise<boolean>;
		/** Inserts an email into persistent storage. */
		insertEmail: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<Email<GenericMetadata, GenericLockId>>;
		/** Updates an email in persistent storage. */
		updateEmail: ({id, update}: {id: string, update: PartialDeep<Email<GenericMetadata, GenericLockId>>}) => Promise<Email<GenericMetadata, GenericLockId>>;
		/** Determines whether the email has already been sent. */
		isDuplicate: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<boolean>;
		/**
			Attempts to consume a rate limit prior to dispatching an email.
			If a rate limit has been reached and thus cannot be consumed at this time, and the email is marked as queueable, the email will be queued to be reattempted later.
		*/
		consumeRateLimit: () => Promise<boolean>;
		/** Inserts a lock into persistent storage. */
		insertLock: ({id, emailId}: {id: GenericLockId, emailId: string}) => Promise<void>;
		/** Deletes a lock in persistent storage. */
		deleteLock: ({id}: {id: GenericLockId}) => Promise<void>;
		/** Resolves webhook handler type to be used in determining the handler callback which should be used in response to a webhook. */
		resolveWebhookHandlerType: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => GenericEmailHandlerType;
	}

	// Webhook Handlers
	export type WebhookHandlers <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType> =
		GenericEmailHandlerType extends string
		?
			{
				[Type in GenericEmailHandlerType]: (({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<void>) | null;
			}
		:
			{}
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
	export interface SendMailOptionsSes
	{
		ConfigurationSetName: string;
		Tags: SendMailOptionsSesTags;
	}
	export interface SendMailOptionsSesTags extends Array<{Name: string, Value: string}> {}
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

	// Errors
	export class EmailUnwantedError extends Error {}
	export class EmailDuplicateError extends Error {}
	export class EmailInvalidError extends Error {}
	export class EmailRateLimitError extends Error {}
	export class EmailQueueTimeoutError extends Error {}
	export class EmailSignatureInvalidError extends Error {}
	export class EmailHandlerNotFoundError extends Error {}
	export class EmailWebookParseError extends Error {}
	export class EmailWebhookInvalid extends Error {}
}