'use strict';

// Types
type Tags <GenericTags> =
{
	[GenericKey in keyof GenericTags]: Array<string>;
};
type Metadata <GenericTags> =
{
	[GenericKey in keyof GenericTags]: string
};

/** Translates AWS SES tags into document metadata object. */
export function generateMetadataFromSesTags <GenericTags extends Tags<GenericTags>> (tags: GenericTags)
{
	const metadata = {} as Metadata <GenericTags>;
	const keys = Object.keys(tags);
	for (let key of keys)
	{
		if (/^ses:/.test(key)) continue;
		const array = tags[key];
		const value = array[0];
		metadata[key] = value;
	};
	return metadata;
};