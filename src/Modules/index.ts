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
interface Callbacks <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType extends string | undefined>
{
	isUnwanted: ({recipient}: {recipient: string}) => Promise<boolean>;
	isLocked: ({id}: {id: GenericLockId}) => Promise<boolean>;
	insertEmail: ({id, email}: {id?: string, email: Omit<Email<GenericMetadata, GenericLockId>, 'id'>}) => Promise<Email<GenericMetadata, GenericLockId>>;
	updateEmail: ({id, update}: {id: string, update: PartialDeep<Email<GenericMetadata, GenericLockId>>}) => Promise<Email<GenericMetadata, GenericLockId>>;
	isDuplicate: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<boolean>;
	consumeRateLimit: () => Promise<boolean>;
	insertLock: ({id, emailId}: {id: GenericLockId, emailId: string}) => Promise<void>;
	deleteLock: ({id}: {id: GenericLockId}) => Promise<void>;
	resolveWebhookHandlerType: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => GenericEmailHandlerType;
};
type WebhookHandlers <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType extends string | undefined> =
	GenericEmailHandlerType extends string
	?
		{
			[Type in GenericEmailHandlerType]: (({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<void>) | null;
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
	ses: AwsSes;
	sns?: AwsSns;
};
interface AwsSes
{
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
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
export class EmailSystem <GenericMetadata extends EmailBaseMetadata, GenericLockId = void, GenericEmailHandlerType extends string | undefined = undefined>
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
		this.sns = new SNS({apiVersion: this.aws.sns?.version ?? AWS_SNS_DEFAULT_VERSION});
	};
	public send = send;
	public webhook = webhook;
	private generateNodemailer()
	{
		const { accessKeyId, secretAccessKey } = this.aws.ses;
		const ses = new SES({accessKeyId, secretAccessKey, apiVersion: this.aws.ses.version ?? AWS_SES_DEFAULT_VERSION});
		const nodemailer = Nodemailer.createTransport({SES: ses});
		return nodemailer;
	};
};

// Errors
export * from './Errors';