export type PDFParsingPartitionElementType =
  | "Address"
  | "EmailAddress"
  | "FigureCaption"
  | "Footer"
  | "Formula"
  | "Header"
  | "Image"
  | "ListItem"
  | "NarrativeText"
  | "PageBreak"
  | "Table"
  | "Title"
  | "UncategorizedText";
export interface PDFParsingPartitionElementMetadata<
  ElementType extends PDFParsingPartitionElementType
> {
  filetype: "application/pdf";
  languages: ["eng"];
  page_number: number;
  parent_id: string;
  filename: string;
  text_as_html: ElementType extends "Table" ? string : never; //for tables
  links?: [
    {
      text: string;
      url: string;
      start_index: number;
    }
  ];
}
export interface PDFParsingPartitionElement<
  ElementType extends PDFParsingPartitionElementType = PDFParsingPartitionElementType
> {
  type: ElementType;
  element_id: string;
  text: string;
  metadata: PDFParsingPartitionElementMetadata<ElementType>;
}
