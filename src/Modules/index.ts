'use strict';

// External Modules
import { SES, SNS } from 'aws-sdk';
import Nodemailer from 'nodemailer';

// Internal Modules
import { send } from './Send';
import { webhook } from './Webhook';
import { Scheduler } from './Scheduler';

// Types
import { PartialDeep } from '@chris-talman/types-helpers';
import { Address as MailOptionsFrom } from 'nodemailer/lib/mailer';
import { Email, EmailBaseMetadata } from './Send';
import { Event } from './Webhook/Handlers/Notification';
interface Callbacks <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType>
{
	isUnwanted: ({recipient}: {recipient: string}) => Promise<boolean>;
	isLocked: ({id}: {id: GenericLockId}) => Promise<boolean>;
	insertEmail: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<Email<GenericMetadata, GenericLockId>>;
	updateEmail: ({id, update}: {id: string, update: PartialDeep<Email<GenericMetadata, GenericLockId>>}) => Promise<Email<GenericMetadata, GenericLockId>>;
	isDuplicate: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<boolean>;
	consumeRateLimit: () => Promise<boolean>;
	insertLock: ({id, emailId}: {id: GenericLockId, emailId: string}) => Promise<void>;
	deleteLock: ({id}: {id: GenericLockId}) => Promise<void>;
	resolveWebhookHandlerType: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => GenericEmailHandlerType;
};
type WebhookHandlers <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType> =
	GenericEmailHandlerType extends string
	?
		{
			[Type in GenericEmailHandlerType]: (({email, event}: {email: Email<GenericMetadata, GenericLockId>, event: Event}) => Promise<void>) | null;
		}
	:
		undefined
;
interface MailOptions
{
	from: MailOptionsFrom;
};
interface Aws
{
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	ses: AwsSes;
	sns?: AwsSns;
};
interface AwsSes
{
	configurationSet: string;
	version?: string;
	rateLimits: AwsSesRateLimits;
};
interface AwsSesRateLimits
{
	day: number;
	second: number;
};
interface AwsSns
{
	version?: string;
};

// Constants
const AWS_SES_DEFAULT_VERSION = '2010-12-01';
const AWS_SNS_DEFAULT_VERSION = '2010-03-31';

// System
export class EmailSystem <GenericMetadata extends EmailBaseMetadata, GenericLockId = void, GenericEmailHandlerType extends string | void = void>
{
	public readonly mailOptions: MailOptions;
	public readonly callbacks: Callbacks <GenericMetadata, GenericLockId, any>;
	public readonly webhookHandlers?: WebhookHandlers <GenericMetadata, GenericLockId, GenericEmailHandlerType>;
	public readonly aws: Aws;
	public readonly queueItemTimeout?: number;
	public readonly scheduler: Scheduler <this>;
	public readonly nodemailer: ReturnType<typeof Nodemailer.createTransport>;
	public readonly sns: SNS;
	constructor({mailOptions, callbacks, webhookHandlers, aws, queueItemTimeout}: Pick<EmailSystem<GenericMetadata, GenericLockId>, 'mailOptions' | 'callbacks' | 'webhookHandlers' | 'aws' | 'queueItemTimeout'>)
	{
		this.callbacks = callbacks;
		this.webhookHandlers = webhookHandlers;
		this.mailOptions = mailOptions;
		this.aws = aws;
		this.queueItemTimeout = queueItemTimeout;
		this.scheduler = new Scheduler({system: this});
		this.nodemailer = this.generateNodemailer();
		this.sns = this.generateSns();
	};
	public send = send;
	public webhook = webhook;
	private generateNodemailer()
	{
		const { accessKeyId, secretAccessKey, region } = this.aws;
		const ses = new SES
		(
			{
				accessKeyId,
				secretAccessKey,
				region,
				apiVersion: this.aws.ses.version ?? AWS_SES_DEFAULT_VERSION
			}
		);
		const nodemailer = Nodemailer.createTransport({SES: ses});
		return nodemailer;
	};
	private generateSns()
	{
		const { accessKeyId, secretAccessKey, region } = this.aws;
		const sns = new SNS
		(
			{
				accessKeyId,
				secretAccessKey,
				region,
				apiVersion: this.aws.sns?.version ?? AWS_SNS_DEFAULT_VERSION
			}
		);
		return sns;
	};
};

// Errors
export * from './Errors';