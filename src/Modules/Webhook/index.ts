'use strict';

// Internal Modules
import { mirror } from '@chris-talman/isomorphic-utilities';
import { createSubsetObject } from '@chris-talman/isomorphic-utilities';
import { EmailHandlerNotFoundError } from 'src/Modules/Errors';
import { EmailSystem } from 'src/Modules';
import { verifySignature } from './Signature';

// Handlers
import { handleSubscriptionConfirmation } from './Handlers/SubscriptionConfirmation';
import { handleNotification } from './Handlers/Notification';

// Types
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
};
export type MessageType = keyof typeof MESSAGE_TYPE;
export interface SubscriptionMessage extends BaseMessage
{
	Type: SubscriptionMessageType;
    SubscribeURL: string;
    Token: string;
};
export type SubscriptionMessageType = keyof typeof MESSAGE_TYPE_SUBSCRIPTION;
export interface NotificationMessage extends BaseMessage
{
	Subject: string;
};
interface Handlers
{
    [eventType: string]: Handler;
};
type Handler = HandlerCallback | null;
type HandlerCallback = ({message: Message, system: GenericEmailSystem}) => Promise<void>;

// Constants
export const MESSAGE_TYPE = mirror
(
	{
		SubscriptionConfirmation: true,
		UnsubscribeConfirmation: true,
		Notification: true
	}
);
const MESSAGE_TYPE_SUBSCRIPTION = createSubsetObject(MESSAGE_TYPE, ['SubscriptionConfirmation', 'UnsubscribeConfirmation']);
const HANDLERS: Handlers =
{
	[MESSAGE_TYPE.SubscriptionConfirmation]: handleSubscriptionConfirmation,
	[MESSAGE_TYPE.UnsubscribeConfirmation]: null,
	[MESSAGE_TYPE.Notification]: handleNotification
};

export async function webhook <GenericEmailSystem extends EmailSystem <any, any, any>> (this: GenericEmailSystem, {message}: {message: Message})
{
	const signatureVerified = await verifySignature({message});
    if (!signatureVerified) return;
    await handleEvent({message, system: this});
};

async function handleEvent <GenericEmailSystem extends EmailSystem <any, any, any>> ({message, system}: {message: Message, system: GenericEmailSystem})
{
    const handler = HANDLERS[message.Type];
    if (!handler)
    {
        throw new EmailHandlerNotFoundError();
    };
	if (handler === null) return;
    await handler({message, system});
};