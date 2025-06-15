import React, { useState } from "react";

const ExpandableDiv = (): React.JSX.Element => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleDiv = (): void => setIsExpanded(!isExpanded);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
                <span onClick={toggleDiv} style={{ cursor: "pointer", fontWeight: "bold", fontSize: "30px" }}>
                    {isExpanded ? "-" : "+"}
                </span>
            </div>
            {isExpanded && (
                <div>
                    <p>Это раскрывающийся контент!</p>
                </div>
            )}
        </div>
    );
};

export default ExpandableDiv;
