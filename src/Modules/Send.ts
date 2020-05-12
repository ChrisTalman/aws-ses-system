'use strict';

// Intenral Modules
import { generateMetadataSesTags } from 'src/Modules/Utilities/GenerateMetadataSesTags';
import { EmailUnwantedError } from './Errors';
import { EmailSystem, BaseMetadata } from './';

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

/**
	Sends email if recipient has no outstanding bounces or complaints.
	If recipient has outstanding bounces or complaints, throws `MailUnwantedError`.
*/
export async function send <GenericMetadata extends BaseMetadata <GenericLockId>, GenericLockId>
(
	this: EmailSystem <GenericMetadata, GenericLockId>,
	{ email, metadata, lockId, useQueue = false, metadataId }:
	{ email: CustomSendMailOptions, metadata: GenericMetadata, lockId?: GenericLockId, useQueue?: boolean, metadataId?: string }
)
{
	if (lockId)
	{
		metadata.lockId = lockId;
		const locked = await this.callbacks.isLocked({id: lockId});
		if (locked)
		{
			console.warn(`Email cannot be sent as it is locked. Metadata ID: ${metadataId}`);
			return;
		};
	};
	const recipient = typeof email.to === 'string' ? email.to : email.to.address;
	const unwanted = await this.callbacks.isUnwanted({recipient});
	if (unwanted)
	{
		throw new EmailUnwantedError();
	};
	const metadataDocument = await this.callbacks.insertMetadata({id: metadataId, metadata});
	const mailOptions: SendMailOptions =
	{
		to: email.to,
		from: generateMailFrom({email, system: this}),
		subject: email.subject,
		text: email.text,
		html: email.html,
		ses:
		{
			ConfigurationSetName: this.aws.configurationSet,
			Tags: generateMetadataSesTags({metadataId: metadataDocument.id})
		},
		headers: email.headers
	};
	const result = await this.scheduler.schedule({email: mailOptions, metadata, useQueue});
	return result;
};

function generateMailFrom <GenericLockId> ({email, system}: {email: CustomSendMailOptions, system: EmailSystem <any, GenericLockId>})
{
	let from: SendMailOptions['from'] =
	{
		address: system.email.from,
		name: system.email.fromName
	};
	if (email.from)
	{
		if (typeof email.from === 'object')
		{
			if (email.from.address !== undefined)
			{
				from.address = email.from.address;
			};
			if (email.from.name !== undefined)
			{
				from.name = email.from.name;
			};
		}
		else
		{
			from = email.from;
		};
	};
	return from;
};