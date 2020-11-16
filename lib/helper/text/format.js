/**
 * @description using for data format convertion
 * @author sessionid
 */
const jsonpToJson = jsonp => jsonp.slice(jsonp.indexOf('(') + 1, jsonp.lastIndexOf(')'));
const jsonpParse = jsonp => JSON.parse(jsonp2JSON(jsonp));
const jsonpStringify = (data, callback) => `${callback}(${JSON.stringify(data)})`;

const jsonp = {
    toJSON: jsonpToJson,
    parse: jsonpParse,
    stringify: jsonpStringify,
};

module.exports = {
    jsonp,
};