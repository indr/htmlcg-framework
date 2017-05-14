'use strict';

function parseData (jsonOrXmlString) {
  if (typeof jsonOrXmlString !== 'string') {
    return null;
  }
  if (jsonOrXmlString.length <= 0) {
    return null;
  }
  if (jsonOrXmlString.match(/^</)) {
    return parseTemplateDataXml(jsonOrXmlString);
  }
  if (jsonOrXmlString.match(/^\{|\[/)) {
    return JSON.parse(jsonOrXmlString);
  }
  console.warn(TAG + 'Unknown data format: ' + jsonOrXmlString.substr(0, 20));
  return null;
}

function parseXml (xmlString) {
  // http://stackoverflow.com/questions/7949752/cross-browser-javascript-xml-parsing
  if (window && window.DOMParser && typeof XMLDocument !== 'undefined') {
    return new DOMParser().parseFromString(xmlString, "text/xml");
  } else { // Internet Explorer
    var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(xmlString);
    return xmlDoc;
  }
}

function parseTemplateDataXml (xmlString) {
  var result = {};
  var xmlDoc = parseXml(xmlString);
  var componentDatas = xmlDoc.getElementsByTagName('componentData');
  for (var i = 0; i < componentDatas.length; i++) {
    var id = componentDatas[ i ].id;
    result[ id ] = componentDatas[ i ].firstChild.attributes.value.value;
  }
  return result;
}

module.exports = {
  parseData: parseData,
  parseXml: parseXml,
  parseTemplateDataXml: parseTemplateDataXml
};
