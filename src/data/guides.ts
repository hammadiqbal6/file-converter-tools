export type { Guide } from './guide-types';
import type { Guide } from './guide-types';
import bankStatementsAsData from './guide-articles/bank-statements-as-data';
import csvJsonPipelines from './guide-articles/csv-json-pipelines';
import heicVsJpg from './guide-articles/heic-vs-jpg';
import markdownHtmlForBlogs from './guide-articles/markdown-html-for-blogs';
import privacyFirstConversion from './guide-articles/privacy-first-conversion';
import psdWithoutPhotoshop from './guide-articles/psd-without-photoshop';
import stlFormatsExplained from './guide-articles/stl-formats-explained';
import stlGcodeSlicerBasics from './guide-articles/stl-gcode-slicer-basics';
import svgToHighResPng from './guide-articles/svg-to-high-res-png';
import tomlVsYamlVsJson from './guide-articles/toml-vs-yaml-vs-json';
import webpVsPngVsJpg from './guide-articles/webp-vs-png-vs-jpg';
import xmlJsonAttributes from './guide-articles/xml-json-attributes';
import yamlVsJson from './guide-articles/yaml-vs-json';

export const guides: Guide[] = [
  bankStatementsAsData,
  csvJsonPipelines,
  heicVsJpg,
  markdownHtmlForBlogs,
  privacyFirstConversion,
  psdWithoutPhotoshop,
  stlFormatsExplained,
  stlGcodeSlicerBasics,
  svgToHighResPng,
  tomlVsYamlVsJson,
  webpVsPngVsJpg,
  xmlJsonAttributes,
  yamlVsJson,
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
