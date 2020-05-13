'use strict';

// External Modules
import { SES, SNS } from 'aws-sdk';
import Nodemailer from 'nodemailer';

// Internal Modules
import { send } from './Send';
import { Scheduler } from './Scheduler';

// Types
import { PartialDeep } from '@chris-talman/types-helpers';
import { Email, EmailBaseMetadata } from './Send';
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
};
type EmailHandlers <GenericMetadata extends EmailBaseMetadata, GenericLockId, GenericEmailHandlerType extends string | void> =
	GenericEmailHandlerType extends string
	?
		{
			[Type in GenericEmailHandlerType]: ({email}: {email: Email<GenericMetadata, GenericLockId>}) => Promise<void>;
		}
	:
		{}
;
interface EmailOptions
{
	from: string;
	fromName: string;
};
interface Aws
{
	accessKeyId: string;
	secretAccessKey: string;
	configurationSet: string;
	ses: AwsSes;
	sns?: AwsSns;
};
interface AwsSes
{
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
export interface EmailTags
{
	emailId: string;
};

// Constants
const AWS_SES_DEFAULT_VERSION = '2010-12-01';
const AWS_SNS_DEFAULT_VERSION = '2010-03-31';

export class EmailSystem <GenericMetadata extends EmailBaseMetadata, GenericLockId = void, GenericEmailHandlerType extends string | undefined = undefined>
{
	public readonly callbacks: Callbacks <GenericMetadata, GenericLockId, any>;
	public readonly emailHandlers: EmailHandlers <GenericMetadata, GenericLockId, GenericEmailHandlerType>;
	public readonly email: EmailOptions;
	public readonly aws: Aws;
	public readonly scheduler: Scheduler <this>;
	public readonly nodemailer: ReturnType<typeof Nodemailer.createTransport>;
	public readonly sns: SNS;
	constructor({callbacks, emailHandlers, email, aws, queueItemTimeout}: Pick<EmailSystem<GenericMetadata, GenericLockId>, 'callbacks' | 'emailHandlers' | 'email' | 'aws'> & { queueItemTimeout: number })
	{
		this.callbacks = callbacks;
		this.emailHandlers = emailHandlers;
		this.email = email;
		this.aws = aws;
		this.scheduler = new Scheduler({queueItemTimeout, system: this});
		this.nodemailer = this.generateNodemailer();
		this.sns = new SNS({apiVersion: this.aws.sns?.version ?? AWS_SNS_DEFAULT_VERSION});
	};
	public send = send;
	private generateNodemailer()
	{
		const { accessKeyId, secretAccessKey } = this.aws;
		const ses = new SES({accessKeyId, secretAccessKey, apiVersion: this.aws.ses.version ?? AWS_SES_DEFAULT_VERSION});
		const nodemailer = Nodemailer.createTransport({SES: ses});
		return nodemailer;
	};
};