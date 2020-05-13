'use strict';

// External Modules
import { ulid } from 'ulid';

// Intenral Modules
import { generateMetadataSesTags } from 'src/Modules/Utilities/GenerateMetadataSesTags';
import { EmailUnwantedError } from './Errors';
import { EmailSystem } from './';

// Types
import { SendMailOptions as BaseSendMailOptions } from 'nodemailer';
import { Address as SendMailOptionsAddress } from 'nodemailer/lib/mailer';
export interface SendMailOptions extends Required<Pick<BaseSendMailOptions, 'to' | 'from' | 'subject' | 'text' | 'html'>>, Pick<BaseSendMailOptions, 'headers'>
{
	to: string | SendMailOptionsAddress;
	ses: SendMailOptionsSes;
	/** Callback to run before email is sent. If it throws an exception, the email will not be sent. */
	pre?: () => Promise<void>;
};
interface SendMailOptionsSes
{
	ConfigurationSetName: string;
	Tags: SendMailOptionsSesTags;
};
interface SendMailOptionsSesTags extends Array<{Name: string, Value: string}> {};
export interface CustomSendMailOptions extends Required<Pick<SendMailOptions, 'to' | 'subject' | 'text' | 'html'>>, Pick<BaseSendMailOptions, 'headers'>
{
	from?: string | Partial<SendMailOptionsAddress>;
};
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
};
export interface EmailBounce
{
	id: string;
	bounceType: string;
	bounceSubType: string;
	/** Unix milliseconds. */
	timestamp: number;
};
export interface EmailComplaint
{
	id: string;
	/** Unix milliseconds. */
	timestamp: number;
};
export interface EmailDelivery
{
	/** Unix milliseconds. */
	timestamp: number;
};
export type EmailBaseMetadata = object;

/**
	Sends email if recipient has no outstanding bounces or complaints.
	If recipient has outstanding bounces or complaints, throws `MailUnwantedError`.
*/
export async function send <GenericEmailSystem extends EmailSystem <GenericMetadata, GenericLockId>, GenericMetadata extends EmailBaseMetadata, GenericLockId>
(
	this: GenericEmailSystem,
	{ email: customMailOptions, metadata, lockId, useQueue = false, emailId }:
	{ email: CustomSendMailOptions, metadata: GenericMetadata, lockId?: GenericLockId, useQueue?: boolean, emailId?: string }
)
{
	const recipient = resolveRecipient(customMailOptions);
	const email: Email <GenericMetadata, GenericLockId> =
	{
		id: emailId ?? ulid(),
		recipient,
		metadata
	};
	if (lockId)
	{
		email.lockId = lockId;
		const locked = await this.callbacks.isLocked({id: lockId});
		if (locked)
		{
			console.warn(`Email cannot be sent as it is locked. Email ID: ${emailId}`);
			return;
		};
	};
	const mailOptions: SendMailOptions =
	{
		to: customMailOptions.to,
		from: generateMailFrom({mailOptions: customMailOptions, system: this}),
		subject: customMailOptions.subject,
		text: customMailOptions.text,
		html: customMailOptions.html,
		ses:
		{
			ConfigurationSetName: this.aws.configurationSet,
			Tags: generateMetadataSesTags({emailId: email.id})
		},
		headers: customMailOptions.headers
	};
	await isEmailUnwanted({email: mailOptions, system: this});
	await this.callbacks.insertEmail({id: email.id, email});
	const result = await this.scheduler.schedule({mailOptions, email, useQueue});
	return result;
};

function generateMailFrom <GenericLockId> ({mailOptions, system}: {mailOptions: CustomSendMailOptions, system: EmailSystem <any, GenericLockId>})
{
	let from: SendMailOptions['from'] =
	{
		address: system.email.from,
		name: system.email.fromName
	};
	if (mailOptions.from)
	{
		if (typeof mailOptions.from === 'object')
		{
			if (mailOptions.from.address !== undefined)
			{
				from.address = mailOptions.from.address;
			};
			if (mailOptions.from.name !== undefined)
			{
				from.name = mailOptions.from.name;
			};
		}
		else
		{
			from = mailOptions.from;
		};
	};
	return from;
};

export async function isEmailUnwanted({email, system}: {email: SendMailOptions, system: EmailSystem <any, any>})
{
	const recipient = resolveRecipient(email);
	const unwanted = await system.callbacks.isUnwanted({recipient});
	if (unwanted)
	{
		throw new EmailUnwantedError();
	};
	return unwanted;
};

function resolveRecipient(mailOptions: CustomSendMailOptions)
{
	const recipient = typeof mailOptions.to === 'string' ? mailOptions.to : mailOptions.to.address;
	return recipient;
};