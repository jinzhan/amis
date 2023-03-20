/**
 * 基于 xsd 文件生成 typescript 定义，简化开发
 */

import {parseXML} from '../src/util/xml';

import * as fs from 'fs';

let outputFile: string[] = ['/** generated by tools/xsd2ts.ts, do not edit */'];

// 所有定义过的类型
const definedTypes: Record<string, boolean> = {};

// 所有使用的类型
const allusedTypes: Record<string, boolean> = {};

outputFile.push(
  ...convertSchema(
    './OfficeOpenXML-XMLSchema-Strict/shared-commonSimpleTypes.xsd'
  )
);
outputFile.push(...convertSchema('./OfficeOpenXML-XMLSchema-Strict/wml.xsd'));

function generateField(attributes: any[]) {
  const result: string[] = [];

  if (!Array.isArray(attributes)) {
    attributes = [attributes];
  }
  for (const attribute of attributes) {
    const attributeName = attribute['@_name'];
    if (attributeName) {
      let attributeType = attribute['@_type'].replace(/s:/g, '');
      allusedTypes[attributeType] = true;
      if (attributeType.startsWith('xsd:')) {
        attributeType = toJavaScriptType(attributeType);
      }
      const use = attribute['@_use'];
      if (use === 'required') {
        result.push(`  ${attributeName}: ${attributeType};`);
      } else {
        result.push(`  ${attributeName}?: ${attributeType};`);
      }
    }

    let ref = attribute['@_ref'];
    if (ref) {
      ref = ref.replace(/r:/g, 'r').replace(/m:/g, '').replace(/sl:/g, '');
      const use = attribute['@_use'];
      if (ref.indexOf(':') !== -1) {
        throw new Error('type has : ' + ref);
      }
      if (use === 'required') {
        result.push(`  ${ref}: string;`);
      } else {
        result.push(`   ${ref}?: string;`);
      }
    }
  }
  return result;
}

function toJavaScriptType(type: string) {
  if (
    type === 'xsd:string' ||
    type === 'xsd:token' ||
    type === 'xsd:hexBinary' ||
    type === 'xsd:dateTime' ||
    type === 'xsd:NCName' ||
    type === 'xsd:base64Binary'
  ) {
    return 'string';
  } else if (
    type === 'xsd:integer' ||
    type === 'xsd:unsignedInt' ||
    type === 'xsd:unsignedLong'
  ) {
    return 'number';
  } else if (type === 'xsd:boolean') {
    return 'boolean';
  }
  throw new Error("can't replace type: " + type);
}

// 解析 schema 输出 ts 定义
function convertSchema(fileName: string) {
  const wml = fs.readFileSync(fileName, 'utf8');

  const schema = parseXML(wml)['xsd:schema'];

  const result: string[] = [];

  for (const key in schema) {
    if (key.startsWith('@_')) {
      continue;
    }
    const value = schema[key];

    if (Array.isArray(value)) {
      // 需要执行两边，第一遍是检查基础类型的基础类型
      for (const item of value) {
        const name = item['@_name'];
        definedTypes[name] = true;
        if (key === 'xsd:complexType') {
          definedTypes[name] = true;
          let attributesAndElements = item['xsd:attribute'];
          if (attributesAndElements && !Array.isArray(attributesAndElements)) {
            attributesAndElements = [attributesAndElements];
          }

          if (item['xsd:sequence']?.['xsd:element']) {
            const elements = item['xsd:sequence']?.['xsd:element'];
            if (elements) {
              if (!attributesAndElements) {
                attributesAndElements = [];
              }
              attributesAndElements = attributesAndElements.concat(elements);
            }
          }
          if (!attributesAndElements) {
            const complexContent = item['xsd:complexContent'];
            if (complexContent) {
              const extension = complexContent['xsd:extension'];
              if (extension) {
                const extensionAttributes = extension['xsd:attribute'];
                const base = extension['@_base'].replace(/s:/g, '');
                if (extensionAttributes) {
                  result.push(`export type ${name} = ${base} & {`);
                  result.push(...generateField(extensionAttributes));
                  result.push('}\n');
                } else {
                  const sequence = extension['xsd:sequence'];
                  if (sequence) {
                    let group = sequence['xsd:group'];
                    let groupStr = '';
                    if (group) {
                      if (!Array.isArray(group)) {
                        group = [group];
                      }
                      for (const g of group) {
                        const ref = g['@_ref'].replace(/s:/g, '');
                        groupStr += ref + ' & ';
                      }
                    }

                    if (attributesAndElements) {
                      result.push(
                        `export type ${name} = ${base} & ${groupStr} {`
                      );
                      result.push(...generateField(attributesAndElements));
                      result.push('}\n');
                    } else {
                      if (groupStr) {
                        result.push(
                          `export type ${name} = ${base} & ${groupStr.slice(
                            0,
                            -3
                          )};`
                        );
                      } else {
                        result.push(`export type ${name} = ${base};`);
                      }
                    }
                  } else {
                    result.push(`export type ${name} = ${base};`);
                  }
                }
              } else {
                result.push(`export type ${name} = any;\n`);
              }
            } else {
              result.push(`export type ${name} = any;\n`);
            }
          } else {
            result.push(`export type ${name} = {`);
            result.push(...generateField(attributesAndElements));
            result.push('}\n');
          }
        } else if (key === 'xsd:simpleType') {
          // 简单类型有几种，
          const restriction = item['xsd:restriction'];
          if (restriction) {
            const base = restriction['@_base'];

            if (base.startsWith('xsd:')) {
              allusedTypes[base] = true;
              const javascriptType = toJavaScriptType(base);
              if (javascriptType === 'string') {
                let enumeration = restriction['xsd:enumeration'];
                if (enumeration) {
                  if (!Array.isArray(enumeration)) {
                    enumeration = [enumeration];
                  }
                  // 如果是数字开头大概不会是 enum
                  if (enumeration[0]['@_value'].match(/^[0-9]/)) {
                    result.push(`export type ${name} = string;`);
                  } else {
                    result.push(`export enum ${name} {`);
                    for (const enumItem of enumeration) {
                      const enumName = enumItem['@_value'];
                      result.push(`  ${enumName} = '${enumName}',`);
                    }
                    result.push('}\n');
                  }
                } else {
                  result.push(`export type ${name} = string;`);
                }
              } else {
                result.push(`export type ${name} = ${javascriptType};`);
              }
            } else if (base.startsWith('s:') || base.startsWith('ST_')) {
              const baseType = base.replace('s:', '');
              allusedTypes[baseType] = true;
              result.push(`export type ${name} = ${baseType};`);
            } else {
              throw new Error('Unknown base type: ' + base);
            }
          }

          const union = item['xsd:union'];
          if (union) {
            const memberTypes = union['@_memberTypes'];
            if (memberTypes) {
              definedTypes[name] = true;
              const members = memberTypes
                .replace(/s:/g, '')
                .split(' ')
                .map((item: string) => {
                  if (item.startsWith('xsd:')) {
                    return toJavaScriptType(item);
                  } else {
                    return item;
                  }
                });
              for (const member of members) {
                allusedTypes[member] = true;
              }
              result.push(`export type ${name} = ${members.join(' | ')};\n`);
            }
          }
        } else if (key === 'xsd:group') {
          const choice = item['xsd:choice'];
          if (choice) {
            let elements = choice['xsd:element'];
            if (elements) {
              if (!Array.isArray(elements)) {
                elements = [elements];
              }
              result.push(`export type ${name} = {`);
              for (const element of elements) {
                const elementName = element['@_name'];
                const elementType = element['@_type'];
                if (elementType) {
                  allusedTypes[elementType] = true;
                  result.push(`  ${elementName}?: ${elementType},`);
                } else {
                  console.warn("can't find type: " + name);
                }
              }
              result.push('}\n');
            }
          }
        }
      }
    }
  }

  return result;
}

for (const key in allusedTypes) {
  if (key.startsWith('xsd:')) {
    continue;
  }
  if (!definedTypes[key]) {
    console.log('Not defined: ' + key);
  }
}

fs.writeFileSync('../src/openxml/Types.ts', outputFile.join('\n'));
