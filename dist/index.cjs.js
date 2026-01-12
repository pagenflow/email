'use strict';

var React = require('react');

const MyComponent = ({ text, variant = "primary", onClick, }) => {
    return (React.createElement("div", { className: `my-component my-component--${variant}`, onClick: onClick }, text));
};

exports.MyComponent = MyComponent;
//# sourceMappingURL=index.cjs.js.map
