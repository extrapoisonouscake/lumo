/**
 * Rectangle/Box in PDF coordinate system (bottom-left is origin). Values are in PDF user space units. Order of values - left, bottom, right, top
 */
export type Rect = [number, number, number, number];
/**
 * Value of color in gray space (0.0 - 1.0)
 */
export type ColorGray = number;
/**
 * Value of color in RGB space. All 3 components in range (0.0 - 1.0).
 */
export type ColorRGB = [ColorGray, ColorGray, ColorGray];
/**
 * List of semantic elements (like headings, paragraphs, tables, figures) found in the document. List is ordered based on the position of elements in the structure tree of the document. For more information on various elements reported in this list, please visit https://opensource.adobe.com/pdftools-sdk-docs/beta/extract
 */
export type ListOfSemanticElementsFoundInThePDF = {
  /**
   * Bounding box enclosing the content items forming this element. E.g. For a table cell, this value won't be the boundary of the cell, but union of the bounds of content (text, images etc.) inside the cell. Not reported for elements which don't have any content items (like empty table cells).
   */
  Bounds?: [number, number, number, number];
  /**
   * Bounding box enlosing the content items, post clipping, forming this element. Only reported if any content item forming this element has an associated clip path. Box in corresponding "Bounds" key always encloses this box.
   */
  ClipBounds?: [number, number, number, number];
  /**
   * List of bounds for each character in this element
   */
  CharBounds?: Rect[];
  /**
   * Font description for the font associated with the first character. Only reported for text elements.
   */
  Font?: {
    /**
     * Alternate font family name
     */
    alt_family_name: string;
    /**
     * The font is embedded in the document or not
     */
    embedded: boolean;
    /**
     * Font's encoding like WinAnsiEncoding, Identity-H, MacRomanEncoding etc.
     */
    encoding: string;
    /**
     * Font's family name. Example - For font "Times Bold Italic", family name is "Times"
     */
    family_name: string;
    /**
     * Font technology (type) - eg. Type 1, TrueType, OpenType
     */
    font_type: string;
    /**
     * Font is italics or not
     */
    italic: boolean;
    /**
     * Font is monospaced or not
     */
    monospaced: boolean;
    /**
     * The PostScript name of the font
     */
    name: string;
    /**
     * Font is a subset i.e. only contains some characters from the original font
     */
    subset: boolean;
    /**
     * Weight (thickness) of the font
     */
    weight: number;
    [k: string]: unknown;
  };
  /**
   * Clip path is associated with the element or not. True if at least one content item forming this element has an associated clip path, false otherwise
   */
  HasClip?: boolean;
  /**
   * BCP-47 code for language of text elements
   */
  Lang?: string;
  /**
   * Page on which the element is present (zero-based).
   */
  Page?: number;
  /**
   * Path describing the location of the element in the structure tree. The type of the element and instance number are also part of the path. For more information, please visit https://opensource.adobe.com/pdftools-sdk-docs/beta/extract
   */
  Path: string;
  /**
   * Text for the element in UTF-8 format. Only reported for text elements. When inline elements are reported separately from parent block element, then this value has references to those inline elements. For more information, please visit https://opensource.adobe.com/pdftools-sdk-docs/beta/extract
   */
  Text?: string;
  /**
   * Text size (in points) of the last character. Only reported for text elements.
   */
  TextSize?: number;
  /**
   * Miscellaneous attributes of the element
   */
  attributes?: {
    /**
     * Line height (in PDF user units) of the text. Only reported for text elements. Inline elements inherit this value from parent element.
     */
    LineHeight?: number;
    /**
     * Amount of padding/spacing (in PDF user units) after the element
     */
    SpaceAfter?: number;
    /**
     * Horizontal alignment (left, right, center, justified) of text inside the element. Only reported for text elements.
     */
    TextAlign?: "Start" | "End" | "Center" | "Justify";
    /**
     * Positioning of the element with respect to the enclosing reference area and other content
     */
    Placement?: "Block" | "Inline" | "Before" | "After" | "Start" | "End";
    /**
     * Rectangle/Box in PDF coordinate system (bottom-left is origin). Values are in PDF user space units. Order of values - left, bottom, right, top
     */
    BBox?: [number, number, number, number];
    /**
     * Number of columns in the table element
     */
    NumCol?: number;
    /**
     * Number of rows in the table element
     */
    NumRow?: number;
    /**
     * Position of text - subscript / superscript / normal
     */
    TextPosition?: "Sub" | "Sup" | "Normal";
    /**
     * First line indent (in PDF user units) in text. Only reported for text elements.
     */
    StartIndent?: number;
    /**
     * Color of text decoration
     */
    TextDecorationColor?: [ColorGray, ColorGray, ColorGray];
    /**
     * Thickness of text decoration (in PDF user Units) rounded off to nearest integer
     */
    TextDecorationThickness?: number;
    /**
     * Type of text decoration - line-through / underline / overline / none
     */
    TextDecorationType?: "LineThrough" | "Underline" | "Overline" | "None";
    /**
     * Vertical placement (top, middle, bottom, justified) of elements inside table cell. Only applicable for table cells.
     */
    BlockAlign?: "Before" | "Middle" | "After" | "Justify";
    /**
     * Color of border(s), if any. Single color reported if all 4 borders are of same color. If colors are different, each border color reported individually in order - top, bottom, left, right. Reported for table cells only.
     */
    BorderColor?:
      | ColorRGB
      | [ColorRGB | null, ColorRGB | null, ColorRGB | null, ColorRGB | null];
    /**
     * Style of border(s), if any. Single style reported if all 4 borders are of same style. If styles are different, each border style reported individually in order - top, bottom, left, right. Reported for table cells only.
     */
    BorderStyle?:
      | (
          | "None"
          | "Hidden"
          | "Dotted"
          | "Dashed"
          | "Solid"
          | "Double"
          | "Grooved"
          | "Ridge"
          | "Inset"
          | "Outset"
        )
      | [
          (
            | "None"
            | "Hidden"
            | "Dotted"
            | "Dashed"
            | "Solid"
            | "Double"
            | "Grooved"
            | "Ridge"
            | "Inset"
            | "Outset"
          ),
          (
            | "None"
            | "Hidden"
            | "Dotted"
            | "Dashed"
            | "Solid"
            | "Double"
            | "Grooved"
            | "Ridge"
            | "Inset"
            | "Outset"
          ),
          (
            | "None"
            | "Hidden"
            | "Dotted"
            | "Dashed"
            | "Solid"
            | "Double"
            | "Grooved"
            | "Ridge"
            | "Inset"
            | "Outset"
          ),
          (
            | "None"
            | "Hidden"
            | "Dotted"
            | "Dashed"
            | "Solid"
            | "Double"
            | "Grooved"
            | "Ridge"
            | "Inset"
            | "Outset"
          )
        ];
    /**
     * Thickness of border(s), if any, (in PDF user units) rounded off to nearest integer. Single thickness value reported if all 4 borders are of same thickness. If thickness varies, thickness of each border reported individually in order - top, bottom, left, right. Reported for table cells only.
     */
    BorderThickness?: number | [number, number, number, number];
    /**
     * Column index of the table cell (zero-based)
     */
    ColIndex?: number;
    /**
     * Height (in PDF user units) of table cell element. Useful for getting table cell dimensions.
     */
    Height?: number;
    /**
     * Horizontal placement (left, center, right, justified) of elements inside table cell
     */
    InlineAlign?: "Start" | "Center" | "End" | "Justify";
    /**
     * Row index of the table cell (zero-based)
     */
    RowIndex?: number;
    /**
     * Width (in PDF user units) of table cell element. Useful for getting table cell dimensions.
     */
    Width?: number;
    /**
     * Value of color in RGB space. All 3 components in range (0.0 - 1.0).
     */
    BackgroundColor?: [ColorGray, ColorGray, ColorGray];
    /**
     * Value of offset (in PDF user units) of text from current baseline. Only reported for text elements.
     */
    BaselineShift?: number;
    /**
     * Number of columns spanned by a table cell
     */
    ColSpan?: number;
    /**
     * Number of rows spanned by a table cell
     */
    RowSpan?: number;
    [k: string]: unknown;
  };
  /**
   * Clockwise skew angle (in degrees) of the last character. Only reported for text elements.
   */
  Skew?: number;
  /**
   * Clockwise rotation angle (in degrees) of the last character. Only reported for text elements.
   */
  Rotation?: number;
  /**
   * Image description
   */
  Image?: {
    /**
     * Bits used for each component of color in a sample
     */
    bits_per_component: 1 | 2 | 4 | 8 | 16;
    /**
     * Description for color space used by the image
     */
    colorspace: {
      /**
       * PDF name of the color space like DeviceGray, CalGray, DeviceRGB, DeviceCMYK, ICCBased e.t.c
       */
      Name: string;
      /**
       * ICC profile characteristics of the color space. Reported only when "Name" is "ICCBased".
       */
      ICCProfile?: {
        /**
         * Profile's CMM identifier
         */
        "CMM ID": string;
        /**
         * ICC name of the color space
         */
        ColorSpace: "Gray" | "RGB" | "CMYK" | "Lab";
        /**
         * ICC name of the color space
         */
        Colorspace: "Gray" | "RGB" | "CMYK" | "Lab";
        /**
         * Profile's creator
         */
        Creator: string;
        /**
         * Date the profile was created
         */
        Date: string;
        /**
         * Type of profile
         */
        "Device Class": "scnr" | "mntr" | "prtr" | "spac";
        /**
         * Various bit settings of the profile
         */
        Flags: string;
        /**
         * Profile's format version number
         */
        ICCVersion: string;
        /**
         * Profile illuminant
         */
        Illuminant: string;
        /**
         * ICC magic number
         */
        Magic: string;
        /**
         * Device manufacturer
         */
        Manufacturer: string;
        /**
         * Device model number
         */
        Model: string;
        /**
         * Profile's name
         */
        Name: string;
        /**
         * Number of components used to represent a color. Gray = 1, RGB = 3, CMYK = 4, Lab = 3
         */
        NumComps: 0 | 1 | 3 | 4;
        /**
         * PCS, XYZ or Lab only
         */
        PCS: string;
        /**
         * Primary Platform
         */
        Platform: string;
        /**
         * Rendering intent
         */
        "Rendering Intent":
          | "AbsoluteColorimetric"
          | "RelativeColorimetric"
          | "Saturation"
          | "Perceptual";
        /**
         * Profile size in bytes
         */
        Size: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    /**
     * Number of bytes in image data stream
     */
    data_length: number;
    /**
     * Height of the image in PDF user units
     */
    height: number;
    /**
     * Horizontal resolution
     */
    resolution_horizontal: number;
    /**
     * Vertical resolution
     */
    resolution_vertical: number;
    /**
     * Width of the image in PDF user units
     */
    width: number;
    [k: string]: unknown;
  };
  /**
   * List of file paths to additional output files (images and spreadsheets). For more information, please see API documentation at https://opensource.adobe.com/pdftools-sdk-docs/beta/extract
   */
  filePaths?: [string, ...string[]];
}[];

export interface PDFServicesParsedResult {
  /**
   * Versions of components used to identify, create and export document's structure tree
   */
  version: {
    schema: "1.1.0";
    structure: string;
    page_segmentation: string;
    json_export: string;
    table_structure?: string;
  };
  /**
   * Metadata about the PDF document
   */
  extended_metadata: {
    /**
     * Modified document identifier. This is same as ID_permanent if the document is not modified.
     */
    ID_instance?: string;
    /**
     * Permanent document identifier
     */
    ID_permanent?: string;
    /**
     * PDF version of the document
     */
    pdf_version: string;
    /**
     * PDF/A (Archival) compliance level
     */
    pdfa_compliance_level: string;
    /**
     * Document is encrypted or not
     */
    is_encrypted: boolean;
    /**
     * Document contains AcroForms or not
     */
    has_acroform: boolean;
    /**
     * Document is digitally signed or not
     */
    is_signed: boolean;
    /**
     * PDF/UA (Universal Accessibility) compliance level
     */
    pdfua_compliance_level: string;
    /**
     * Number of pages in the document
     */
    page_count: number;
    /**
     * Document contains embedded files or not
     */
    has_embedded_files: boolean;
    /**
     * Document has been digitally signed with a certifying signature or not
     */
    is_certified: boolean;
    /**
     * Document is based on the XFA (Extensible Forms Architecture) format or not
     */
    is_XFA: boolean;
    /**
     * Predominate natural language (as a BCP-47 code) for text in the document
     */
    language: string;
    /**
     * Base version of document's Adobe extensions to ISO 32000 (aka ISO PDF)
     */
    extension_base_version?: string;
    /**
     * Extension level of document's Adobe extensions to ISO 32000 (aka ISO PDF)
     */
    extension_level?: number;
    [k: string]: unknown;
  };
  elements: ListOfSemanticElementsFoundInThePDF;
  /**
   * A list of properties for each page of the PDF
   */
  pages?: [
    {
      /**
       * Page number (zero-based).
       */
      page_number: number;
      /**
       * Width (in PDF user units) of the page.
       */
      width: number;
      /**
       * Height (in PDF user units) of the page.
       */
      height: number;
      /**
       * Page is scanned or not.
       */
      is_scanned: boolean;
      /**
       * Clockwise rotation value of the page (in degrees).
       */
      rotation: 0 | 90 | 180 | 270;
      /**
       * Multiplier on the size of the default user space unit (eg. 1 == 72/inch)
       */
      user_units?: number;
      boxes: {
        /**
         * Rectangle/Box in PDF coordinate system (bottom-left is origin). Values are in PDF user space units. Order of values - left, bottom, right, top
         */
        MediaBox?: [number, number, number, number];
        /**
         * Rectangle/Box in PDF coordinate system (bottom-left is origin). Values are in PDF user space units. Order of values - left, bottom, right, top
         */
        CropBox?: [number, number, number, number];
        [k: string]: unknown;
      };
    },
    ...{
      /**
       * Page number (zero-based).
       */
      page_number: number;
      /**
       * Width (in PDF user units) of the page.
       */
      width: number;
      /**
       * Height (in PDF user units) of the page.
       */
      height: number;
      /**
       * Page is scanned or not.
       */
      is_scanned: boolean;
      /**
       * Clockwise rotation value of the page (in degrees).
       */
      rotation: 0 | 90 | 180 | 270;
      /**
       * Multiplier on the size of the default user space unit (eg. 1 == 72/inch)
       */
      user_units?: number;
      boxes: {
        /**
         * Rectangle/Box in PDF coordinate system (bottom-left is origin). Values are in PDF user space units. Order of values - left, bottom, right, top
         */
        MediaBox?: [number, number, number, number];
        /**
         * Rectangle/Box in PDF coordinate system (bottom-left is origin). Values are in PDF user space units. Order of values - left, bottom, right, top
         */
        CropBox?: [number, number, number, number];
        [k: string]: unknown;
      };
    }[]
  ];
}
