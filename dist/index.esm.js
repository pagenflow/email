import React from 'react';

const MyComponent = ({ text, variant = "primary", onClick, }) => {
    return (React.createElement("div", { className: `my-component my-component--${variant}`, onClick: onClick }, text));
};

export { MyComponent };
//# sourceMappingURL=index.esm.js.map
