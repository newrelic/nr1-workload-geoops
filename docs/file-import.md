# Map Location file import

## Application file import

We recognize adding points one-by-one can become tedious, as such we've designed a file upload process and format.

It's worth noting, the file itself is not stored or transmitted to New Relic. The file is read locally by your browser, and we send its contents to our document storage called NerdStorage. The data is secure in transit, but it not encrypted at rest, please keep this in mind as you populate fields like `title` and `description`.

### Process

- Read file locally
- Parse as JSON
- Run JSON through ajv JSON schema validator
- Display JSON schema errors
- Upon successful validation, display a portion of the contents to you in a table for verification
- "Save and continue" - we save the data to a NerdStorage document collection

Currently we do _not_:

- Delete records before saving the contents of this file. If you wish to "start fresh" there is an option under the Map List screen in the application for "Delete Markers"
- Attempt to deduplicate records in the file
- Merge with any existing data in the collection

## CLI file import

We are working on a process and CLI command by which you can send this data directly into NerdStorage for process-driven
