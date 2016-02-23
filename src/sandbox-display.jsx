/**
 * Stateless component for displaying things in the react sandbox.
 */

const React = require("react");
const { StyleSheet, css } = require("aphrodite");

const SandboxInstance = require("./sandbox-instance.jsx");

const RP = React.PropTypes;

const SandboxDisplay = React.createClass({
    propTypes: {
        // A list of [label, key] pairs, one per component loadable in the
        // sandbox.
        componentList: RP.arrayOf(RP.arrayOf(RP.string.isRequired).isRequired),

        selectedComponent: RP.shape({
            // A key identifying the currently selected component
            key: RP.string.isRequired,

            // A reference to the currently selected component
            reference: RP.func,

            // A list of instances of props to pass to the component
            fixtures: RP.shape({
                instances: RP.arrayOf(RP.object.isRequired).isRequired,
                log: RP.arrayOf(RP.string.isRequired)
            }),
        }),

        // Called with the key of the component to select
        onComponentSelect: RP.func.isRequired,

        // Called with the index and prop values of the fixture to update.
        onFixtureUpdate: RP.func.isRequired,
    },

    render() {
        // TODO(jlfwong): Adding entire new fixtures

        const {
            componentList,
            selectedComponent,
            onComponentSelect,
            onFixtureUpdate,
        } = this.props;

        if (!componentList) {
            // TODO(jlfwong): Nicer loading indicator
            return <div>Loading...</div>;
        }

        let content = "";

        if (selectedComponent) {
            if (!selectedComponent.reference) {
                content = `Loading ${selectedComponent.key}...`;
            } else {
                const name = selectedComponent.reference.displayName;
                const {fixtures} = selectedComponent;

                if (fixtures == null) {
                    content = `Loading fixtures for ${name}...`;
                } else {
                    content = <div>
                        <h1>{name}</h1>
                        {fixtures.instances.length > 0 ?
                            fixtures.instances.map((props, i) => {
                                return <SandboxInstance
                                    key={i}
                                    component={selectedComponent.reference}
                                    props={props}
                                    callbacksToLog={fixtures.log || []}
                                    onFixtureUpdate={(newProps) => {
                                        onFixtureUpdate(i, newProps);
                                    }}
                                />;
                            })
                            :
                            "No fixtures for this component yet. Add some!"
                        }
                    </div>
                }
            }
        }

        return <div className={css(styles.root)}>
            {/* TODO(jlfwong): Switch this to autocomplete */}
            <select
                value={selectedComponent && selectedComponent.key}
                onChange={(ev) => onComponentSelect(ev.target.value)}
            >
                {componentList.map(([label, key]) => {
                    return <option value={key} key={key}>
                        {label}
                    </option>;
                })}
            </select>
            <div>
                {content}
            </div>
        </div>;
    },
});

const styles = StyleSheet.create({
    root: {
        textAlign: 'center',
        padding: 20
    }
});

module.exports = SandboxDisplay;
