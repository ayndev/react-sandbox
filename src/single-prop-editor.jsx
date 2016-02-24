
const React = require("react");
const { StyleSheet, css } = require("aphrodite");

const { inferTypes } = require("./prop-type-tools.js");

const RP = React.PropTypes;

const FIELD_RENDERERS = (() => {
    const string = ({value, onChange}) => {
        return <input
            className={css(styles.stringInput)}
            type="text"
            value={value}
            onChange={(ev) => onChange(ev.target.value)}
        />;
    };

    const bool = ({value, onChange}) => {
        return <input
            type="checkbox"
            checked={value}
            onChange={(ev) => onChange(ev.target.checked)}
        />;
    };

    const number = ({value, onChange}) => {
        return <input
            type="number"
            value={value}
            onChange={(ev) => onChange(parseFloat(ev.target.value, 10))}
        />;
    };

    const oneOf = ({type, value, onChange}) => {
        return <select
            value={value}
            onChange={(ev) => onChange(ev.target.value)}
        >
            {type.args[0].map(option => {
                return <option key={option} value={option}>
                    {option}
                </option>
            })}
        </select>;
    };

    const arrayOf = ({name, value, type, onChange}) => {
        const arrayVal = value || [];

        // TODO(jlfwong): Add ability to add or remove values
        return arrayVal.map((item, index) => {
            return <div className={css(styles.nestedProp)} key={index}>
                <SinglePropEditor
                    name={`${name}[${index}]`}
                    type={type.args[0]}
                    value={item}
                    onChange={newVal => {
                        onChange(arrayVal.slice(0, index)
                                    .concat([newVal])
                                    .concat(arrayVal.slice(index + 1)));
                    }}
                />
            </div>;
        }).concat([<button key='add'>Add to {name}</button>]);
    };

    const shape = ({name, value, type, onChange}) => {
        const shape = type.args[0];
        const objVal = value || {};
        return Object.keys(shape).map((childKey) => {
            return <div className={css(styles.nestedProp)} key={childKey}>
                <SinglePropEditor
                    name={`${name}.${childKey}`}
                    type={shape[childKey]}
                    value={objVal[childKey]}
                    onChange={newVal => {
                        onChange({
                            ...objVal,
                            [childKey]: newVal
                        });
                    }}
                />
            </div>;
        });
    };

    const json = ({value, onChange}) => {
        return JSON.stringify(value);
    };

    const nullable = (inputType, props) => {
        const {onChange, value} = props;

        return <div className={css(styles.nullableField)}>
            {FIELD_RENDERERS[inputType](props)}
            <div className={css(styles.nullContainer)}>
                <button
                    onClick={() => onChange(null)}
                    disabled={value == null}
                >
                    null
                </button>
            </div>
        </div>;
    };

    return {
        string,
        node: string,
        element: string,
        bool,
        number,
        oneOf,
        arrayOf,
        shape,
        json,
        nullable
    };
})();

const SinglePropEditor = React.createClass({
    propTypes: {
        // The type of the prop to edit. This will match the values of return
        // type of inferTypes.
        type: RP.oneOfType([
            RP.func.isRequired,
            RP.shape({
                type: RP.string.isRequired,
                required: RP.bool.isRequired,
                args: RP.array(RP.object.isRequired),
            }).isRequired
        ]).isRequired,

        // The name of the prop
        name: RP.string.isRequired,

        // The current value of this prop.
        value: RP.any,

        onChange: RP.func.isRequired,
    },

    render() {
        const {name, type} = this.props;

        // TODO(jlfwong): Editing
        // TODO(jlfwong): Adding to lists
        // TODO(jlfwong): Adding to objectOf
        // TODO(jlfwong): Nullability
        // TODO(jlfwong): The rest of the proptypes
        // TODO(jlfwong): Drag to re-arrange in arrays

        const inputType = FIELD_RENDERERS[type.type] ? type.type : 'json';

        const fieldEditor = type.required ?
            FIELD_RENDERERS[inputType](this.props) :
            FIELD_RENDERERS.nullable(inputType, this.props);

        return <div className={css(styles.singleField)}>
            <span className={css(styles.nameLabel)}>
                {name}
            </span>
            {fieldEditor}
        </div>
    },
});

const styles = StyleSheet.create({
    singleField: {
        borderBottom: '1px dotted grey',
        position: 'relative',
        padding: '15px 0 5px 0',
        textAlign: 'left',
    },
    nullableField: {
        display: 'flex',
    },
    nameLabel: {
        position: 'absolute',
        fontFamily: 'monospace',
        fontSize: 10,
        top: 0,
        left: 0,
    },
    nestedProp: {
        marginLeft: 10,
    },
    stringInput: {
        boxSizing: 'border-box',
        width: '95%',
    }
});

module.exports = SinglePropEditor;
