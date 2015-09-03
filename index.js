var asciiFolding = require('diacritics').remove;

function sanitizeFieldName(val) {
    val = String(val).trim();
    if (val.length === 0) {
        throw new Error('Invalid source');
    }
    return val;
}

module.exports = exports = function sluggablePlugin(schema, options) {
    options = options || {};
    var slug = options.field ? String(options.field) : 'slug',
        unique = options.unique ? true : false,
        source = options.source ? options.source : 'title',
        separator = options.separator ? String(options.separator) : '-',
        updatable = ((options.separator) || (options.separator === undefined)) ? true : false;

    schema.pre('save', function (next) {
        if (updatable === false && this[field]) {
            next();
            return;
        }

        value = '',
        field = '',
        errorFields = [];
        if (typeof source === 'string') {
            field = sanitizeFieldName(source);
            errorFields.push(field);
            value = String(this[field] || '').trim();
        } else if (source instanceof Array) {
            var array = [],
                i;
            for (i = 0; i < source.length; i++) {
                field = sanitizeFieldName(source[i]);
                errorFields.push(field);
                array.push(String(this[field] || '').trim());
            }
            value = array.join(separator);
        } else {
            throw new Error('Source can be an array or a string');
        }

        value = asciiFolding(String(value).trim()).toLowerCase().replace('/^[a-z0-9]/g', separator).trim();

        if (value.length === 0) {
            throw new Error('One of the fields is requried: ' + String(errorFields.join(', ')));
        }

        if (!unique) {
            this[slug] = value;
            next();
            return;
        }

        // TODO: unique
        this[slug] = value;
        next();
    });
};