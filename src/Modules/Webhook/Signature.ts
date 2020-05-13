'use strict';

// External Modules
import MessageValidator from '@nathancahill/sns-validator';

// Internal Modules
import { EmailSignatureInvalidError } from 'src/Modules/Errors';

// Types
import { Message } from './';

// Constants
const MESSAGE_SIGNATURE_INVALID_ERROR_MESSAGE = 'The message signature is invalid.';

// Validator
const validator = new MessageValidator();

export async function verifySignature({message}: {message: Message})
{
	try
	{
		await validator.validate(message);
	}
	catch (error)
	{
		if (isInvalidError(error))
		{
			throw new EmailSignatureInvalidError();
		}
		else
		{
			throw error;
		};
	};
	return true;
};

/**
	Determines whether error indicates that message signature is invalid.
	If false, the error is transient or unexpected.
*/
function isInvalidError(error: any)
{
	const invalid = error.message === MESSAGE_SIGNATURE_INVALID_ERROR_MESSAGE;
	return invalid;
};