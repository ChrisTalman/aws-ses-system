'use strict';

// External Modules
import { SES } from 'aws-sdk';
import Nodemailer from 'nodemailer';

// Internal Modules
import { send } from './Send';
import { Scheduler } from './Scheduler';

// Types
interface Callbacks <GenericLockId>
{
	isLocked: ({id}: {id: GenericLockId}) => Promise<boolean>;
	isUnwanted: ({recipient}: {recipient: string}) => Promise<boolean>;
	insertMetadata: ({id, metadata}: {id?: string, metadata: object}) => Promise<{id: string}>;
	consumeRateLimit: () => Promise<boolean>;
	insertLock: ({id, metadataId}: {id: string, metadataId: string}) => Promise<void>;
	deleteLock: ({id}: {id: string}) => Promise<void>;
};
interface Email
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
export interface BaseMetadata <GenericLockId>
{
	id: string;
	lockId: GenericLockId;
};

// Constants
const AWS_SES_DEFAULT_VERSION = '2010-12-01';
const AWS_SNS_DEFAULT_VERSION = '2010-03-31';

export class EmailSystem <GenericMetadata extends BaseMetadata <GenericLockId>, GenericLockId = void>
{
	public readonly callbacks: Callbacks <GenericLockId>;
	public readonly email: Email;
	public readonly aws: Aws;
	public readonly scheduler: Scheduler <this>;
	public readonly nodemailer: ReturnType<typeof Nodemailer.createTransport>;
	constructor({callbacks, email, aws, queueItemTimeout}: Pick<EmailSystem<GenericMetadata, GenericLockId>, 'callbacks' | 'email' | 'aws'> & { queueItemTimeout: number })
	{
		this.callbacks = callbacks;
		this.email = email;
		this.aws = aws;
		this.scheduler = new Scheduler({queueItemTimeout, system: this});
		this.nodemailer = this.generateNodemailer();
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