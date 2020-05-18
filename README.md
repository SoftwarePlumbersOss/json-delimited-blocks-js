# Json Delimited Blocks

A simple streaming format:

{ length: 1023 } ... 1023 bytes of binary data
{ length: 10 } ... 10 bytes of binary data

where the json block can contain any other json metadata.

